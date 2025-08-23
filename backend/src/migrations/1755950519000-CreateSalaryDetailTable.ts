import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

export class CreateSalaryDetailTable1755950519000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 创建salary_details表
        await queryRunner.createTable(new Table({
            name: "salary_details",
            columns: [
                {
                    name: "id",
                    type: "integer",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "employeeId",
                    type: "integer",
                    isNullable: false,
                    comment: "员工ID"
                },
                {
                    name: "attendanceMonthlyReportId",
                    type: "integer",
                    isNullable: true,
                    comment: "月度考勤报告ID"
                },
                {
                    name: "reportMonth",
                    type: "varchar",
                    length: "7",
                    isNullable: false,
                    comment: "工资月份，格式：YYYY-MM"
                },
                {
                    name: "employeeNo",
                    type: "varchar",
                    length: "20",
                    isNullable: false,
                    comment: "员工工号"
                },
                {
                    name: "employeeName",
                    type: "varchar",
                    length: "50",
                    isNullable: false,
                    comment: "员工姓名"
                },
                {
                    name: "expectedWorkingDays",
                    type: "decimal",
                    precision: 4,
                    scale: 1,
                    default: 0,
                    comment: "应出勤天数"
                },
                {
                    name: "actualWorkingDays",
                    type: "decimal",
                    precision: 4,
                    scale: 1,
                    default: 0,
                    comment: "实出勤天数"
                },
                {
                    name: "baseSalary",
                    type: "decimal",
                    precision: 10,
                    scale: 2,
                    default: 0,
                    comment: "综合合计（每月的正常薪酬）"
                },
                {
                    name: "attendanceSalary",
                    type: "decimal",
                    precision: 10,
                    scale: 2,
                    default: 0,
                    comment: "考勤工资（根据实际出勤天数计算）"
                },
                {
                    name: "personalLeaveDeduction",
                    type: "decimal",
                    precision: 10,
                    scale: 2,
                    default: 0,
                    comment: "事假扣款"
                },
                {
                    name: "allowanceAndBonus",
                    type: "decimal",
                    precision: 10,
                    scale: 2,
                    default: 0,
                    comment: "补助/奖金"
                },
                {
                    name: "grossSalary",
                    type: "decimal",
                    precision: 10,
                    scale: 2,
                    default: 0,
                    comment: "应发工资（考勤工资 - 事假扣款 + 补助奖金）"
                },
                {
                    name: "socialInsurance",
                    type: "decimal",
                    precision: 10,
                    scale: 2,
                    default: 0,
                    comment: "社保（个人部分）"
                },
                {
                    name: "housingFund",
                    type: "decimal",
                    precision: 10,
                    scale: 2,
                    default: 0,
                    comment: "住房公积金（个人部分）"
                },
                {
                    name: "incomeTax",
                    type: "decimal",
                    precision: 10,
                    scale: 2,
                    default: 0,
                    comment: "个人所得税"
                },
                {
                    name: "mealFee",
                    type: "decimal",
                    precision: 10,
                    scale: 2,
                    default: 0,
                    comment: "伙食费"
                },
                {
                    name: "otherDeductions",
                    type: "decimal",
                    precision: 10,
                    scale: 2,
                    default: 0,
                    comment: "其他扣款"
                },
                {
                    name: "netSalary",
                    type: "decimal",
                    precision: 10,
                    scale: 2,
                    default: 0,
                    comment: "实发工资（应发工资 - 社保 - 公积金 - 个税 - 伙食费 - 其他扣款）"
                },
                {
                    name: "status",
                    type: "enum",
                    enum: ["draft", "calculated", "confirmed", "paid", "cancelled"],
                    default: "'draft'",
                    comment: "工资详情状态"
                },
                {
                    name: "calculatedAt",
                    type: "timestamp",
                    isNullable: true,
                    comment: "工资计算时间"
                },
                {
                    name: "confirmedAt",
                    type: "timestamp",
                    isNullable: true,
                    comment: "工资确认时间"
                },
                {
                    name: "confirmedBy",
                    type: "integer",
                    isNullable: true,
                    comment: "确认人ID"
                },
                {
                    name: "paidAt",
                    type: "timestamp",
                    isNullable: true,
                    comment: "工资发放时间"
                },
                {
                    name: "paidBy",
                    type: "integer",
                    isNullable: true,
                    comment: "发放人ID"
                },
                {
                    name: "remark",
                    type: "text",
                    isNullable: true,
                    comment: "备注信息"
                },
                {
                    name: "calculationSnapshot",
                    type: "json",
                    isNullable: true,
                    comment: "工资计算数据快照，用于审计追溯"
                },
                {
                    name: "createdAt",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP",
                    comment: "创建时间"
                },
                {
                    name: "updatedAt",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
                    comment: "更新时间"
                }
            ]
        }), true);

        // 创建唯一索引：员工ID和月份的组合必须唯一
        await queryRunner.createIndex("salary_details", new TableIndex({
            name: "IDX_SALARY_EMPLOYEE_MONTH_UNIQUE",
            columnNames: ["employeeId", "reportMonth"],
            isUnique: true
        }));

        // 创建普通索引：便于按月份查询
        await queryRunner.createIndex("salary_details", new TableIndex({
            name: "IDX_SALARY_REPORT_MONTH",
            columnNames: ["reportMonth"]
        }));

        // 创建外键：关联员工表
        await queryRunner.createForeignKey("salary_details", new TableForeignKey({
            columnNames: ["employeeId"],
            referencedColumnNames: ["id"],
            referencedTableName: "employees",
            onDelete: "CASCADE"
        }));

        // 创建外键：关联月度考勤报告表
        await queryRunner.createForeignKey("salary_details", new TableForeignKey({
            columnNames: ["attendanceMonthlyReportId"],
            referencedColumnNames: ["id"],
            referencedTableName: "attendance_monthly_reports",
            onDelete: "SET NULL"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 删除外键
        const table = await queryRunner.getTable("salary_details");
        if (table) {
            const foreignKeys = table.foreignKeys;
            for (const foreignKey of foreignKeys) {
                await queryRunner.dropForeignKey("salary_details", foreignKey);
            }
        }

        // 删除索引
        await queryRunner.dropIndex("salary_details", "IDX_SALARY_EMPLOYEE_MONTH_UNIQUE");
        await queryRunner.dropIndex("salary_details", "IDX_SALARY_REPORT_MONTH");

        // 删除表
        await queryRunner.dropTable("salary_details");
    }
}
