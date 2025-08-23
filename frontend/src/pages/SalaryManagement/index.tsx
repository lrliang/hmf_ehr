import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Typography, 
  Table, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Button, 
  Space, 
  Tag, 
  Tooltip, 
  Modal, 
  message,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Alert,
  Progress,
  Descriptions,
  Divider,
  Badge,
  Checkbox
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  ExportOutlined,
  EyeOutlined,
  CalculatorOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  DeleteOutlined,
  UserOutlined,
  CalendarOutlined,
  MoneyCollectOutlined
} from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { salaryApi } from '@/services';
import { SalaryDetailStatus } from '@/types';
import type { 
  SalaryDetail, 
  QuerySalaryDetailParams,
  CalculateSalaryParams,
  PaginatedResult,
  SalaryStatistics,
  BatchSalaryCalculationResult
} from '@/types';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// 工资状态标签配置
const statusTagConfig = {
  [SalaryDetailStatus.DRAFT]: { color: 'default', text: '草稿' },
  [SalaryDetailStatus.CALCULATED]: { color: 'blue', text: '已计算' },
  [SalaryDetailStatus.CONFIRMED]: { color: 'green', text: '已确认' },
  [SalaryDetailStatus.PAID]: { color: 'success', text: '已发放' },
  [SalaryDetailStatus.CANCELLED]: { color: 'red', text: '已取消' },
};

const SalaryManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [calculateForm] = Form.useForm();
  
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PaginatedResult<SalaryDetail>>({
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [calculateModalVisible, setCalculateModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SalaryDetail | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [calculating, setCalculating] = useState(false);
  const [calculationResult, setCalculationResult] = useState<BatchSalaryCalculationResult | null>(null);
  const [statistics, setStatistics] = useState<SalaryStatistics | null>(null);

  // 查询参数
  const [queryParams, setQueryParams] = useState<QuerySalaryDetailParams>({
    page: 1,
    limit: 10,
    sortBy: 'reportMonth',
    sortOrder: 'DESC'
  });

  // 获取工资详情列表
  const fetchSalaryDetails = useCallback(async (params?: QuerySalaryDetailParams) => {
    setLoading(true);
    try {
      const finalParams = { ...queryParams, ...params };
      const result = await salaryApi.getSalaryDetails(finalParams);
      setData(result);
      setQueryParams(finalParams);
    } catch (error: any) {
      message.error(error.message || '获取工资详情失败');
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  // 获取统计数据
  const fetchStatistics = useCallback(async (month?: string) => {
    if (!month) return;
    try {
      const result = await salaryApi.getSalaryStatistics(month);
      setStatistics(result.data);
    } catch (error: any) {
      console.error('获取统计数据失败:', error);
    }
  }, []);

  // 初始化数据
  useEffect(() => {
    fetchSalaryDetails();
    // 获取当前月份统计
    const currentMonth = dayjs().format('YYYY-MM');
    fetchStatistics(currentMonth);
  }, []);

  // 搜索处理
  const handleSearch = (values: any) => {
    const searchParams: QuerySalaryDetailParams = {
      page: 1,
      limit: queryParams.limit,
      ...values
    };

    // 处理月份范围
    if (values.monthRange && values.monthRange.length === 2) {
      searchParams.startMonth = values.monthRange[0].format('YYYY-MM');
      searchParams.endMonth = values.monthRange[1].format('YYYY-MM');
    }

    fetchSalaryDetails(searchParams);
  };

  // 重置搜索
  const handleReset = () => {
    form.resetFields();
    fetchSalaryDetails({ 
      page: 1, 
      limit: queryParams.limit,
      sortBy: 'reportMonth',
      sortOrder: 'DESC'
    });
  };

  // 查看详情
  const handleViewDetail = (record: SalaryDetail) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  // 计算工资
  const handleCalculate = async (values: any) => {
    setCalculating(true);
    try {
      const params: CalculateSalaryParams = {
        reportMonth: values.reportMonth.format('YYYY-MM'),
        employeeIds: values.employeeIds?.length > 0 ? values.employeeIds : undefined,
        forceRecalculate: values.forceRecalculate || false,
      };

      const result = await salaryApi.calculateSalary(params);
      setCalculationResult(result);
      
      if (result.successCount > 0) {
        message.success(`工资计算完成！成功：${result.successCount}条，失败：${result.failureCount}条`);
        fetchSalaryDetails(); // 刷新列表
        fetchStatistics(params.reportMonth); // 刷新统计
      } else {
        message.warning('工资计算完成，但没有成功的记录');
      }
    } catch (error: any) {
      message.error(error.message || '工资计算失败');
    } finally {
      setCalculating(false);
    }
  };

  // 确认工资
  const handleConfirm = async (record: SalaryDetail) => {
    try {
      await salaryApi.confirmSalaryDetail(record.id, 1); // TODO: 使用实际用户ID
      message.success('工资确认成功');
      fetchSalaryDetails();
    } catch (error: any) {
      message.error(error.message || '工资确认失败');
    }
  };

  // 标记发放
  const handleMarkPaid = async (record: SalaryDetail) => {
    try {
      await salaryApi.markSalaryAsPaid(record.id, 1); // TODO: 使用实际用户ID
      message.success('工资发放标记成功');
      fetchSalaryDetails();
    } catch (error: any) {
      message.error(error.message || '工资发放标记失败');
    }
  };

  // 批量确认
  const handleBatchConfirm = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要确认的工资记录');
      return;
    }

    try {
      await salaryApi.batchConfirmSalaryDetails(
        selectedRowKeys as number[], 
        1 // TODO: 使用实际用户ID
      );
      message.success('批量确认成功');
      setSelectedRowKeys([]);
      fetchSalaryDetails();
    } catch (error: any) {
      message.error(error.message || '批量确认失败');
    }
  };

  // 删除工资详情
  const handleDelete = async (record: SalaryDetail) => {
    try {
      await salaryApi.deleteSalaryDetail(record.id);
      message.success('删除成功');
      fetchSalaryDetails();
    } catch (error: any) {
      message.error(error.message || '删除失败');
    }
  };

  // 导出数据
  const handleExport = async () => {
    try {
      const blob = await salaryApi.exportSalaryDetails(queryParams);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `工资详情_${dayjs().format('YYYY-MM-DD')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      message.success('导出成功');
    } catch (error: any) {
      message.error(error.message || '导出失败');
    }
  };

  // 表格列定义
  const columns: ColumnsType<SalaryDetail> = [
    {
      title: '工资月份',
      dataIndex: 'reportMonth',
      key: 'reportMonth',
      width: 120,
      sorter: true,
      render: (text) => (
        <Space>
          <CalendarOutlined />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: '员工信息',
      key: 'employee',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <UserOutlined />
            <Text strong>{record.employeeName}</Text>
          </Space>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            工号：{record.employeeNo}
          </Text>
        </Space>
      ),
    },
    {
      title: '考勤天数',
      key: 'workingDays',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>应出勤：{record.expectedWorkingDays}天</Text>
          <Text>实出勤：{record.actualWorkingDays}天</Text>
        </Space>
      ),
    },
    {
      title: '基础工资',
      dataIndex: 'baseSalary',
      key: 'baseSalary',
      width: 120,
      align: 'right',
      render: (amount) => (
        <Text strong style={{ color: '#1890ff' }}>
          ¥{amount?.toLocaleString() || '0.00'}
        </Text>
      ),
    },
    {
      title: '应发工资',
      dataIndex: 'grossSalary',
      key: 'grossSalary',
      width: 120,
      align: 'right',
      render: (amount) => (
        <Text strong style={{ color: '#52c41a' }}>
          ¥{amount?.toLocaleString() || '0.00'}
        </Text>
      ),
    },
    {
      title: '实发工资',
      dataIndex: 'netSalary',
      key: 'netSalary',
      width: 120,
      align: 'right',
      render: (amount) => (
        <Text strong style={{ color: '#f5222d', fontSize: '16px' }}>
          ¥{amount?.toLocaleString() || '0.00'}
        </Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: SalaryDetailStatus) => {
        const config = statusTagConfig[status];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '计算时间',
      dataIndex: 'calculatedAt',
      key: 'calculatedAt',
      width: 180,
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          
          {record.status === SalaryDetailStatus.CALCULATED && (
            <Tooltip title="确认工资">
              <Popconfirm
                title="确认工资"
                description="确认后工资信息将不能修改，是否继续？"
                onConfirm={() => handleConfirm(record)}
                okText="确认"
                cancelText="取消"
              >
                <Button 
                  type="text" 
                  icon={<CheckCircleOutlined />} 
                  style={{ color: '#52c41a' }}
                />
              </Popconfirm>
            </Tooltip>
          )}
          
          {record.status === SalaryDetailStatus.CONFIRMED && (
            <Tooltip title="标记发放">
              <Popconfirm
                title="标记工资发放"
                description="确认已发放此工资？"
                onConfirm={() => handleMarkPaid(record)}
                okText="确认"
                cancelText="取消"
              >
                <Button 
                  type="text" 
                  icon={<DollarOutlined />} 
                  style={{ color: '#1890ff' }}
                />
              </Popconfirm>
            </Tooltip>
          )}
          
          {record.status === SalaryDetailStatus.DRAFT && (
            <Tooltip title="删除">
              <Popconfirm
                title="确认删除"
                description="确定要删除这条工资记录吗？"
                onConfirm={() => handleDelete(record)}
                okText="确认"
                cancelText="取消"
              >
                <Button 
                  type="text" 
                  danger
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // 表格行选择
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    getCheckboxProps: (record: SalaryDetail) => ({
      disabled: record.status === SalaryDetailStatus.PAID || record.status === SalaryDetailStatus.CANCELLED,
    }),
  };

  return (
    <>
      <Helmet>
        <title>{`薪酬管理 - ${import.meta.env.VITE_APP_TITLE || 'HMF EHR 系统'}`}</title>
      </Helmet>
      
      <div className="page-container">
        <div className="page-header">
          <Title level={2} className="page-title">薪酬管理</Title>
        </div>

        {/* 统计卡片 */}
        {statistics && (
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="总员工数" 
                  value={statistics.totalEmployees}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="总应发工资" 
                  value={statistics.totalGrossSalary}
                  precision={2}
                  prefix={<MoneyCollectOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="总实发工资" 
                  value={statistics.totalNetSalary}
                  precision={2}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="已发放" 
                  value={statistics.statusDistribution.paid}
                  suffix={`/ ${statistics.totalEmployees}`}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>
        )}

        <Card>
          {/* 搜索表单 */}
          <Form
            form={form}
            layout="inline"
            onFinish={handleSearch}
            style={{ marginBottom: 16 }}
          >
            <Form.Item name="employeeNo" label="员工工号">
              <Input placeholder="请输入员工工号" allowClear />
            </Form.Item>
            
            <Form.Item name="employeeName" label="员工姓名">
              <Input placeholder="请输入员工姓名" allowClear />
            </Form.Item>
            
            <Form.Item name="reportMonth" label="工资月份">
              <DatePicker.MonthPicker placeholder="选择月份" />
            </Form.Item>
            
            <Form.Item name="monthRange" label="月份范围">
              <RangePicker.MonthPicker placeholder={['开始月份', '结束月份']} />
            </Form.Item>
            
            <Form.Item name="status" label="状态">
              <Select
                placeholder="选择状态"
                allowClear
                mode="multiple"
                style={{ minWidth: 120 }}
              >
                {Object.entries(statusTagConfig).map(([value, config]) => (
                  <Option key={value} value={value}>
                    <Tag color={config.color}>{config.text}</Tag>
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                  搜索
                </Button>
                <Button onClick={handleReset} icon={<ReloadOutlined />}>
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Form>

          {/* 操作按钮 */}
          <div style={{ marginBottom: 16 }}>
            <Space>
              <Button 
                type="primary" 
                icon={<CalculatorOutlined />}
                onClick={() => setCalculateModalVisible(true)}
              >
                计算工资
              </Button>
              
              <Button 
                icon={<CheckCircleOutlined />}
                disabled={selectedRowKeys.length === 0}
                onClick={handleBatchConfirm}
              >
                批量确认
              </Button>
              
              <Button icon={<ExportOutlined />} onClick={handleExport}>
                导出数据
              </Button>
              
              <Button icon={<ReloadOutlined />} onClick={() => fetchSalaryDetails()}>
                刷新
              </Button>
            </Space>
          </div>

          {/* 数据表格 */}
          <Table
            columns={columns}
            dataSource={data.data}
            rowKey="id"
            loading={loading}
            rowSelection={rowSelection}
            scroll={{ x: 1400 }}
            pagination={{
              current: data.page,
              pageSize: data.limit,
              total: data.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
              onChange: (page, limit) => {
                fetchSalaryDetails({ ...queryParams, page, limit });
              },
              onShowSizeChange: (current, size) => {
                fetchSalaryDetails({ ...queryParams, page: 1, limit: size });
              },
            }}
          />
        </Card>

        {/* 工资详情模态框 */}
        <Modal
          title="工资详情"
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              关闭
            </Button>
          ]}
          width={800}
        >
          {selectedRecord && (
            <Descriptions
              bordered
              column={2}
              labelStyle={{ width: '120px', fontWeight: 'bold' }}
            >
              <Descriptions.Item label="工资月份" span={1}>
                <Badge status="processing" text={selectedRecord.reportMonth} />
              </Descriptions.Item>
              <Descriptions.Item label="工资状态" span={1}>
                <Tag color={statusTagConfig[selectedRecord.status].color}>
                  {statusTagConfig[selectedRecord.status].text}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="员工工号">{selectedRecord.employeeNo}</Descriptions.Item>
              <Descriptions.Item label="员工姓名">{selectedRecord.employeeName}</Descriptions.Item>
              
              <Descriptions.Item label="应出勤天数">{selectedRecord.expectedWorkingDays}天</Descriptions.Item>
              <Descriptions.Item label="实出勤天数">{selectedRecord.actualWorkingDays}天</Descriptions.Item>
              
              <Descriptions.Item label="基础工资">
                <Text style={{ color: '#1890ff', fontWeight: 'bold' }}>
                  ¥{selectedRecord.baseSalary?.toLocaleString() || '0.00'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="考勤工资">
                <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>
                  ¥{selectedRecord.attendanceSalary?.toLocaleString() || '0.00'}
                </Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="事假扣款">
                <Text style={{ color: '#f5222d' }}>
                  -¥{selectedRecord.personalLeaveDeduction?.toLocaleString() || '0.00'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="补助奖金">
                <Text style={{ color: '#52c41a' }}>
                  +¥{selectedRecord.allowanceAndBonus?.toLocaleString() || '0.00'}
                </Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="应发工资">
                <Text style={{ color: '#52c41a', fontWeight: 'bold', fontSize: '16px' }}>
                  ¥{selectedRecord.grossSalary?.toLocaleString() || '0.00'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="社保">
                <Text style={{ color: '#f5222d' }}>
                  -¥{selectedRecord.socialInsurance?.toLocaleString() || '0.00'}
                </Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="公积金">
                <Text style={{ color: '#f5222d' }}>
                  -¥{selectedRecord.housingFund?.toLocaleString() || '0.00'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="个人所得税">
                <Text style={{ color: '#f5222d' }}>
                  -¥{selectedRecord.incomeTax?.toLocaleString() || '0.00'}
                </Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="伙食费">
                <Text style={{ color: '#f5222d' }}>
                  -¥{selectedRecord.mealFee?.toLocaleString() || '0.00'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="其他扣款">
                <Text style={{ color: '#f5222d' }}>
                  -¥{selectedRecord.otherDeductions?.toLocaleString() || '0.00'}
                </Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="实发工资" span={2}>
                <Text style={{ color: '#f5222d', fontWeight: 'bold', fontSize: '18px' }}>
                  ¥{selectedRecord.netSalary?.toLocaleString() || '0.00'}
                </Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="计算时间" span={2}>
                {selectedRecord.calculatedAt 
                  ? dayjs(selectedRecord.calculatedAt).format('YYYY-MM-DD HH:mm:ss')
                  : '-'
                }
              </Descriptions.Item>
              
              {selectedRecord.confirmedAt && (
                <Descriptions.Item label="确认时间" span={2}>
                  {dayjs(selectedRecord.confirmedAt).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
              )}
              
              {selectedRecord.paidAt && (
                <Descriptions.Item label="发放时间" span={2}>
                  {dayjs(selectedRecord.paidAt).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
              )}
              
              {selectedRecord.remark && (
                <Descriptions.Item label="备注" span={2}>
                  {selectedRecord.remark}
                </Descriptions.Item>
              )}
            </Descriptions>
          )}
        </Modal>

        {/* 计算工资模态框 */}
        <Modal
          title="计算工资"
          open={calculateModalVisible}
          onCancel={() => {
            setCalculateModalVisible(false);
            setCalculationResult(null);
            calculateForm.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={calculateForm}
            layout="vertical"
            onFinish={handleCalculate}
          >
            <Form.Item
              name="reportMonth"
              label="工资月份"
              rules={[{ required: true, message: '请选择工资月份' }]}
            >
              <DatePicker.MonthPicker 
                placeholder="选择要计算的月份"
                style={{ width: '100%' }}
              />
            </Form.Item>
            
            <Form.Item name="employeeIds" label="指定员工（可选）">
              <Select
                mode="multiple"
                placeholder="不选择则计算所有员工"
                allowClear
                showSearch
                optionFilterProp="children"
              >
                {/* TODO: 从员工API获取员工列表 */}
              </Select>
            </Form.Item>
            
            <Form.Item name="forceRecalculate" valuePropName="checked">
              <Checkbox>强制重新计算（覆盖已存在的工资记录）</Checkbox>
            </Form.Item>
            
            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button 
                  onClick={() => {
                    setCalculateModalVisible(false);
                    setCalculationResult(null);
                    calculateForm.resetFields();
                  }}
                >
                  取消
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={calculating}
                  icon={<CalculatorOutlined />}
                >
                  开始计算
                </Button>
              </Space>
            </Form.Item>
          </Form>
          
          {/* 计算结果显示 */}
          {calculationResult && (
            <>
              <Divider orientation="left">计算结果</Divider>
              <Alert
                message={`计算完成：成功 ${calculationResult.successCount} 条，失败 ${calculationResult.failureCount} 条`}
                type={calculationResult.successCount > 0 ? 'success' : 'warning'}
                showIcon
                style={{ marginBottom: 16 }}
              />
              
              <Progress 
                percent={Math.round((calculationResult.successCount / calculationResult.totalCount) * 100)}
                status={calculationResult.failureCount > 0 ? 'active' : 'success'}
                format={() => `${calculationResult.successCount}/${calculationResult.totalCount}`}
              />
              
              {calculationResult.errorSummary && calculationResult.errorSummary.length > 0 && (
                <>
                  <Divider orientation="left">错误详情</Divider>
                  <Alert
                    message="计算失败的记录"
                    description={
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {calculationResult.errorSummary.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    }
                    type="error"
                    showIcon
                  />
                </>
              )}
            </>
          )}
        </Modal>
      </div>
    </>
  );
};

export default SalaryManagement;
