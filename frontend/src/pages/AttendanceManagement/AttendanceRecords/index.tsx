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
  Upload,
  Alert,
  Progress,
  List
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  ExportOutlined,
  ImportOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  FileExcelOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { attendanceApi } from '@/services';
import { 
  AttendanceResult,
  AttendanceType
} from '@/types';
import type { 
  AttendanceRecord, 
  QueryAttendanceRecordParams,
  UpdateAttendanceRecordParams,
  PaginatedResult,
  ImportResult,
  ImportError
} from '@/types';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

// 打卡结果标签配置
const resultTagConfig = {
  [AttendanceResult.ON_TIME]: { color: 'green', text: '正常打卡' },
  [AttendanceResult.LATE]: { color: 'orange', text: '迟到' },
  [AttendanceResult.EARLY_LEAVE]: { color: 'red', text: '早退' },
  [AttendanceResult.ABSENT]: { color: 'red', text: '缺勤' },
  [AttendanceResult.OVERTIME]: { color: 'blue', text: '加班' },
  [AttendanceResult.MANUAL]: { color: 'purple', text: '手动补签' },
};

// 打卡类型标签配置
const typeTagConfig = {
  [AttendanceType.CHECK_IN]: { color: 'cyan', text: '上班打卡' },
  [AttendanceType.CHECK_OUT]: { color: 'geekblue', text: '下班打卡' },
  [AttendanceType.BREAK_OUT]: { color: 'gold', text: '外出打卡' },
  [AttendanceType.BREAK_IN]: { color: 'lime', text: '回到打卡' },
};

const AttendanceRecords: React.FC = () => {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PaginatedResult<AttendanceRecord>>({
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [statistics, setStatistics] = useState({
    total: 0,
    normal: 0,
    late: 0,
    earlyLeave: 0,
    absent: 0,
    overtime: 0,
  });

  // 搜索参数
  const [searchParams, setSearchParams] = useState<QueryAttendanceRecordParams>({
    page: 1,
    pageSize: 10,
  });

  // 加载数据
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await attendanceApi.getAttendanceRecords(searchParams);
      setData(result);
      
      // 计算统计数据
      const stats = result.data.reduce((acc, record) => {
        acc.total++;
        switch (record.result) {
          case AttendanceResult.ON_TIME:
            acc.normal++;
            break;
          case AttendanceResult.LATE:
            acc.late++;
            break;
          case AttendanceResult.EARLY_LEAVE:
            acc.earlyLeave++;
            break;
          case AttendanceResult.ABSENT:
            acc.absent++;
            break;
          case AttendanceResult.OVERTIME:
            acc.overtime++;
            break;
        }
        return acc;
      }, { total: 0, normal: 0, late: 0, earlyLeave: 0, absent: 0, overtime: 0 });
      
      setStatistics(stats);
    } catch (error) {
      message.error('获取打卡明细失败');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 搜索处理
  const handleSearch = (values: Record<string, unknown>) => {
    const params: QueryAttendanceRecordParams = {
      page: 1,
      pageSize: searchParams.pageSize,
      ...values,
    };

    // 处理日期范围
    if (values.dateRange && Array.isArray(values.dateRange) && values.dateRange.length === 2) {
      params.startDate = values.dateRange[0].format('YYYY-MM-DD');
      params.endDate = values.dateRange[1].format('YYYY-MM-DD');
    }

    setSearchParams(params);
  };

  // 重置搜索
  const handleReset = () => {
    form.resetFields();
    setSearchParams({ page: 1, pageSize: 10 });
  };

  // 翻页处理
  const handleTableChange = (pagination: { current?: number; pageSize?: number }) => {
    setSearchParams({
      ...searchParams,
      page: pagination.current || searchParams.page,
      pageSize: pagination.pageSize || searchParams.pageSize,
    });
  };

  // 查看详情
  const handleViewDetail = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  // 编辑记录
  const handleEdit = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    editForm.setFieldsValue({
      result: record.result,
      exceptionReason: record.exceptionReason,
      adminRemark: record.adminRemark,
    });
    setEditModalVisible(true);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    try {
      const values = await editForm.validateFields();
      if (!selectedRecord) return;

      const updateData: UpdateAttendanceRecordParams = {
        result: values.result,
        exceptionReason: values.exceptionReason,
        adminRemark: values.adminRemark,
      };

      await attendanceApi.updateAttendanceRecord(selectedRecord.id, updateData);
      message.success('记录修改成功');
      setEditModalVisible(false);
      loadData();
    } catch (error) {
      message.error('记录修改失败');
    }
  };

  // 删除记录
  const handleDelete = async (id: number) => {
    try {
      await attendanceApi.deleteAttendanceRecord(id);
      message.success('记录删除成功');
      loadData();
    } catch (error) {
      message.error('记录删除失败');
    }
  };

  // 导出数据
  const handleExport = async () => {
    try {
      const blob = await attendanceApi.exportAttendanceRecords(searchParams);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `打卡明细_${dayjs().format('YYYY-MM-DD')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
    }
  };

  // 导入数据
  const handleImport = () => {
    setImportResult(null);
    setImportModalVisible(true);
  };

  // 处理文件上传
  const handleFileUpload = async (file: File) => {
    // 验证文件类型
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      message.error('请上传Excel文件(.xlsx或.xls格式)');
      return false;
    }

    // 验证文件大小（10MB）
    if (file.size > 10 * 1024 * 1024) {
      message.error('文件大小不能超过10MB');
      return false;
    }

    setImporting(true);
    try {
      const result = await attendanceApi.importAttendanceRecords(file);
      setImportResult(result);
      
      if (result.success > 0) {
        message.success(`成功导入 ${result.success} 条记录`);
        // 刷新数据列表
        loadData();
      }
      
      if (result.failed > 0) {
        message.warning(`${result.failed} 条记录导入失败，请查看错误详情`);
      }
    } catch (error: any) {
      message.error(`导入失败: ${error.message || '未知错误'}`);
    } finally {
      setImporting(false);
    }
    
    return false; // 阻止默认上传行为
  };

  // 关闭导入模态框
  const handleCloseImportModal = () => {
    setImportModalVisible(false);
    setImportResult(null);
  };

  // 表格列定义
  const columns: ColumnsType<AttendanceRecord> = [
    {
      title: '员工姓名',
      dataIndex: ['employee', 'name'],
      key: 'employeeName',
      width: 100,
      fixed: 'left',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <span>{text || '未知'}</span>
          <span style={{ fontSize: '12px', color: '#666' }}>
            {record.employee?.employeeNo}
          </span>
        </Space>
      ),
    },
    {
      title: '考勤日期',
      dataIndex: 'attendanceDate',
      key: 'attendanceDate',
      width: 110,
      render: (date) => dayjs(date).format('YYYY-MM-DD'),
      sorter: (a, b) => dayjs(a.attendanceDate).unix() - dayjs(b.attendanceDate).unix(),
    },
    {
      title: '考勤时间',
      dataIndex: 'attendanceTime',
      key: 'attendanceTime',
      width: 90,
      render: (time) => time || '--',
    },
    {
      title: '打卡时间',
      dataIndex: 'checkTime',
      key: 'checkTime',
      width: 130,
      render: (time) => time ? dayjs(time).format('MM-DD HH:mm:ss') : '--',
      sorter: (a, b) => {
        if (!a.checkTime && !b.checkTime) return 0;
        if (!a.checkTime) return -1;
        if (!b.checkTime) return 1;
        return dayjs(a.checkTime).unix() - dayjs(b.checkTime).unix();
      },
    },
    {
      title: '打卡类型',
      dataIndex: 'attendanceType',
      key: 'attendanceType',
      width: 100,
      render: (type) => {
        const config = typeTagConfig[type as AttendanceType];
        return config ? (
          <Tag color={config.color}>{config.text}</Tag>
        ) : <Tag>{type}</Tag>;
      },
    },
    {
      title: '打卡结果',
      dataIndex: 'result',
      key: 'result',
      width: 100,
      render: (result) => {
        const config = resultTagConfig[result as AttendanceResult];
        return config ? (
          <Tag color={config.color}>{config.text}</Tag>
        ) : <Tag>{result}</Tag>;
      },
    },
    {
      title: '打卡地址',
      dataIndex: 'address',
      key: 'address',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (address) => address ? (
        <Tooltip placement="topLeft" title={address}>
          {address}
        </Tooltip>
      ) : '--',
    },
    {
      title: '打卡备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (remark) => remark ? (
        <Tooltip placement="topLeft" title={remark}>
          {remark}
        </Tooltip>
      ) : '--',
    },
    {
      title: '异常原因',
      dataIndex: 'exceptionReason',
      key: 'exceptionReason',
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (reason) => reason ? (
        <Tooltip placement="topLeft" title={reason}>
          <Tag color="red">{reason}</Tag>
        </Tooltip>
      ) : '--',
    },
    {
      title: '打卡设备',
      dataIndex: 'device',
      key: 'device',
      width: 100,
      render: (device) => device || '--',
    },
    {
      title: '管理员备注',
      dataIndex: 'adminRemark',
      key: 'adminRemark',
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (remark) => remark ? (
        <Tooltip placement="topLeft" title={remark}>
          <Tag color="blue">{remark}</Tag>
        </Tooltip>
      ) : '--',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="link" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              type="link" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这条打卡记录吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button 
                type="link" 
                danger 
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>{`打卡明细 - ${'HMF EHR 系统'}`}</title>
      </Helmet>

      <div className="page-container">
        <div className="page-header">
          <Title level={2} className="page-title">打卡明细</Title>
        </div>

        {/* 统计卡片 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card size="small">
              <Statistic
                title="总打卡数"
                value={statistics.total}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card size="small">
              <Statistic
                title="正常打卡"
                value={statistics.normal}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card size="small">
              <Statistic
                title="迟到次数"
                value={statistics.late}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card size="small">
              <Statistic
                title="早退次数"
                value={statistics.earlyLeave}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card size="small">
              <Statistic
                title="缺勤次数"
                value={statistics.absent}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card size="small">
              <Statistic
                title="加班次数"
                value={statistics.overtime}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 搜索表单 */}
        <Card style={{ marginBottom: 16 }}>
          <Form
            form={form}
            layout="inline"
            onFinish={handleSearch}
            style={{ marginBottom: 16 }}
          >
            <Form.Item name="employeeName" label="员工姓名">
              <Input 
                placeholder="请输入员工姓名" 
                allowClear
                style={{ width: 140 }}
              />
            </Form.Item>
            <Form.Item name="dateRange" label="日期范围">
              <RangePicker 
                format="YYYY-MM-DD"
                style={{ width: 240 }}
              />
            </Form.Item>
            <Form.Item name="attendanceType" label="打卡类型">
              <Select 
                placeholder="选择打卡类型" 
                allowClear
                style={{ width: 120 }}
              >
                <Option value={AttendanceType.CHECK_IN}>上班打卡</Option>
                <Option value={AttendanceType.CHECK_OUT}>下班打卡</Option>
                <Option value={AttendanceType.BREAK_OUT}>外出打卡</Option>
                <Option value={AttendanceType.BREAK_IN}>回到打卡</Option>
              </Select>
            </Form.Item>
            <Form.Item name="result" label="打卡结果">
              <Select 
                placeholder="选择打卡结果" 
                allowClear
                style={{ width: 120 }}
              >
                <Option value={AttendanceResult.ON_TIME}>正常打卡</Option>
                <Option value={AttendanceResult.LATE}>迟到</Option>
                <Option value={AttendanceResult.EARLY_LEAVE}>早退</Option>
                <Option value={AttendanceResult.ABSENT}>缺勤</Option>
                <Option value={AttendanceResult.OVERTIME}>加班</Option>
                <Option value={AttendanceResult.MANUAL}>手动补签</Option>
              </Select>
            </Form.Item>
            <Form.Item name="isManual" label="补签记录">
              <Select 
                placeholder="选择补签状态" 
                allowClear
                style={{ width: 100 }}
              >
                <Option value={true}>是</Option>
                <Option value={false}>否</Option>
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
                <Button onClick={handleExport} icon={<ExportOutlined />}>
                  导出
                </Button>
                <Button onClick={handleImport} icon={<ImportOutlined />}>
                  导入
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        {/* 数据表格 */}
        <Card>
          <Table
            columns={columns}
            dataSource={data.data}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1800 }}
            pagination={{
              current: data.page,
              pageSize: data.limit,
              total: data.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            }}
            onChange={handleTableChange}
          />
        </Card>

        {/* 详情模态框 */}
        <Modal
          title="打卡记录详情"
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={null}
          width={600}
        >
          {selectedRecord && (
            <div>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div><UserOutlined /> <strong>员工姓名:</strong> {selectedRecord.employee?.name}</div>
                </Col>
                <Col span={12}>
                  <div><strong>员工编号:</strong> {selectedRecord.employee?.employeeNo}</div>
                </Col>
                <Col span={12}>
                  <div><CalendarOutlined /> <strong>考勤日期:</strong> {dayjs(selectedRecord.attendanceDate).format('YYYY-MM-DD')}</div>
                </Col>
                <Col span={12}>
                  <div><ClockCircleOutlined /> <strong>考勤时间:</strong> {selectedRecord.attendanceTime}</div>
                </Col>
                <Col span={12}>
                  <div><strong>打卡时间:</strong> {selectedRecord.checkTime ? dayjs(selectedRecord.checkTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</div>
                </Col>
                <Col span={12}>
                  <div><strong>打卡类型:</strong> {typeTagConfig[selectedRecord.attendanceType as AttendanceType]?.text}</div>
                </Col>
                <Col span={12}>
                  <div><strong>打卡结果:</strong> {resultTagConfig[selectedRecord.result as AttendanceResult]?.text}</div>
                </Col>
                <Col span={12}>
                  <div><strong>是否补签:</strong> {selectedRecord.isManual ? '是' : '否'}</div>
                </Col>
                <Col span={24}>
                  <div><EnvironmentOutlined /> <strong>打卡地址:</strong> {selectedRecord.address || '--'}</div>
                </Col>
                <Col span={12}>
                  <div><strong>打卡设备:</strong> {selectedRecord.device || '--'}</div>
                </Col>
                <Col span={12}>
                  <div><strong>工作班次:</strong> {selectedRecord.shift || '--'}</div>
                </Col>
                {selectedRecord.remark && (
                  <Col span={24}>
                    <div><strong>打卡备注:</strong> {selectedRecord.remark}</div>
                  </Col>
                )}
                {selectedRecord.exceptionReason && (
                  <Col span={24}>
                    <div><strong>异常原因:</strong> {selectedRecord.exceptionReason}</div>
                  </Col>
                )}
                {selectedRecord.adminRemark && (
                  <Col span={24}>
                    <div><strong>管理员备注:</strong> {selectedRecord.adminRemark}</div>
                  </Col>
                )}
                {selectedRecord.deviceInfo && (
                  <Col span={24}>
                    <div><strong>设备信息:</strong> {selectedRecord.deviceInfo}</div>
                  </Col>
                )}
                <Col span={12}>
                  <div><strong>创建时间:</strong> {dayjs(selectedRecord.createdAt).format('YYYY-MM-DD HH:mm:ss')}</div>
                </Col>
                <Col span={12}>
                  <div><strong>更新时间:</strong> {dayjs(selectedRecord.updatedAt).format('YYYY-MM-DD HH:mm:ss')}</div>
                </Col>
              </Row>
            </div>
          )}
        </Modal>

        {/* 编辑模态框 */}
        <Modal
          title="编辑打卡记录"
          open={editModalVisible}
          onOk={handleSaveEdit}
          onCancel={() => setEditModalVisible(false)}
          okText="保存"
          cancelText="取消"
        >
          <Form
            form={editForm}
            layout="vertical"
          >
            <Form.Item
              name="result"
              label="打卡结果"
              rules={[{ required: true, message: '请选择打卡结果' }]}
            >
              <Select placeholder="请选择打卡结果">
                <Option value={AttendanceResult.ON_TIME}>正常打卡</Option>
                <Option value={AttendanceResult.LATE}>迟到</Option>
                <Option value={AttendanceResult.EARLY_LEAVE}>早退</Option>
                <Option value={AttendanceResult.ABSENT}>缺勤</Option>
                <Option value={AttendanceResult.OVERTIME}>加班</Option>
                <Option value={AttendanceResult.MANUAL}>手动补签</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="exceptionReason"
              label="异常打卡原因"
            >
              <TextArea rows={3} placeholder="请输入异常打卡原因" />
            </Form.Item>
            <Form.Item
              name="adminRemark"
              label="管理员修改备注"
              rules={[{ required: true, message: '请输入管理员修改备注' }]}
            >
              <TextArea rows={3} placeholder="请输入管理员修改备注" />
            </Form.Item>
          </Form>
        </Modal>

        {/* 导入模态框 */}
        <Modal
          title={<span><ImportOutlined /> 导入Excel打卡明细</span>}
          open={importModalVisible}
          onCancel={handleCloseImportModal}
          footer={null}
          width={600}
          destroyOnClose
        >
          {!importResult ? (
            <div>
              <Alert
                message="导入说明"
                description={
                  <div>
                    <p>1. 请确保Excel文件包含以下列（顺序可以不同）：</p>
                    <p style={{ marginLeft: 20, color: '#1890ff' }}>
                      姓名、考勤日期、考勤时间、打卡时间、打卡结果、打卡地址、打卡备注、异常打卡原因、打卡设备、管理员修改备注
                    </p>
                    <p>2. 其中 <strong style={{ color: '#f5222d' }}>姓名、考勤日期、考勤时间、打卡结果</strong> 为必填字段</p>
                    <p>3. 打卡结果支持：正常打卡/正常、迟到、早退、缺勤、加班、手动补签/补签</p>
                    <p>4. 文件大小不能超过10MB</p>
                  </div>
                }
                type="info"
                style={{ marginBottom: 20 }}
              />

              <Upload.Dragger
                name="file"
                multiple={false}
                accept=".xlsx,.xls"
                beforeUpload={handleFileUpload}
                style={{ marginBottom: 20 }}
              >
                <p className="ant-upload-drag-icon">
                  <FileExcelOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                </p>
                <p className="ant-upload-text">点击或拖拽Excel文件到此区域上传</p>
                <p className="ant-upload-hint">
                  支持单个文件上传，仅支持 .xlsx 和 .xls 格式
                </p>
              </Upload.Dragger>

              {importing && (
                <div style={{ textAlign: 'center' }}>
                  <Progress type="circle" percent={50} status="active" />
                  <p style={{ marginTop: 16 }}>正在导入数据，请稍候...</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <Alert
                message="导入完成"
                description={
                  <div>
                    <p><strong>总计处理：</strong>{importResult.total} 条记录</p>
                    <p><CheckCircleOutlined style={{ color: '#52c41a' }} /> <strong>成功导入：</strong>{importResult.success} 条</p>
                    <p><CloseCircleOutlined style={{ color: '#f5222d' }} /> <strong>导入失败：</strong>{importResult.failed} 条</p>
                    {importResult.duration && (
                      <p><strong>处理耗时：</strong>{importResult.duration}ms</p>
                    )}
                  </div>
                }
                type={importResult.failed > 0 ? "warning" : "success"}
                style={{ marginBottom: 20 }}
              />

              {importResult.errors && importResult.errors.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: 16 }}>错误详情：</h4>
                  <List
                    size="small"
                    bordered
                    dataSource={importResult.errors}
                    renderItem={(error: ImportError) => (
                      <List.Item>
                        <div style={{ width: '100%' }}>
                          <div style={{ color: '#f5222d', fontWeight: 'bold' }}>
                            第 {error.row} 行：{error.message}
                          </div>
                          {error.data && (
                            <div style={{ 
                              marginTop: 8, 
                              padding: 8, 
                              backgroundColor: '#fafafa', 
                              borderRadius: 4,
                              fontSize: 12,
                              color: '#666'
                            }}>
                              原始数据：{JSON.stringify(error.data)}
                            </div>
                          )}
                        </div>
                      </List.Item>
                    )}
                    style={{ maxHeight: 300, overflow: 'auto' }}
                  />
                </div>
              )}

              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <Space>
                  <Button onClick={handleCloseImportModal}>
                    关闭
                  </Button>
                  <Button type="primary" onClick={() => {
                    setImportResult(null);
                    setImportModalVisible(true);
                  }}>
                    继续导入
                  </Button>
                </Space>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </>
  );
};

export default AttendanceRecords;
