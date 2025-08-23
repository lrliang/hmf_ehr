import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateAttendanceMonthlyReportTable1755943189766 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 创建attendance_monthly_reports表
        await queryRunner.createTable(new Table({
            name: "attendance_monthly_reports",
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
                    name: "reportMonth",
                    type: "varchar",
                    length: "7",
                    isNullable: false,
                    comment: "报告月份，格式：YYYY-MM"
                },
                {
                    name: "employeeNo",
                    type: "varchar",
                    length: "20",
                    isNullable: false,
                    comment: "员工工号"
                },
                {
                    name: "realName",
                    type: "varchar",
                    length: "50",
                    isNullable: false,
                    comment: "真实姓名"
                },
                {
                    name: "nickname",
                    type: "varchar",
                    length: "50",
                    isNullable: true,
                    comment: "员工昵称"
                },
                // 出勤统计
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
                    name: "legalHolidayDays",
                    type: "decimal",
                    precision: 4,
                    scale: 1,
                    default: 0,
                    comment: "法定假天数"
                },
                {
                    name: "absentDays",
                    type: "decimal",
                    precision: 4,
                    scale: 1,
                    default: 0,
                    comment: "旷工天数"
                },
                // 各种假期天数
                {
                    name: "personalLeaveDays",
                    type: "decimal",
                    precision: 4,
                    scale: 1,
                    default: 0,
                    comment: "事假（天）"
                },
                {
                    name: "annualLeaveDays",
                    type: "decimal",
                    precision: 4,
                    scale: 1,
                    default: 0,
                    comment: "年假（天）"
                },
                {
                    name: "compensatoryLeaveDays",
                    type: "decimal",
                    precision: 4,
                    scale: 1,
                    default: 0,
                    comment: "调休假（天）"
                },
                {
                    name: "sickLeaveDays",
                    type: "decimal",
                    precision: 4,
                    scale: 1,
                    default: 0,
                    comment: "病假（天）"
                },
                {
                    name: "breastfeedingLeaveDays",
                    type: "decimal",
                    precision: 4,
                    scale: 1,
                    default: 0,
                    comment: "哺乳假（天）"
                },
                {
                    name: "prenatalCheckupLeaveDays",
                    type: "decimal",
                    precision: 4,
                    scale: 1,
                    default: 0,
                    comment: "孕检假（天）"
                },
                {
                    name: "childcareLeaveDays",
                    type: "decimal",
                    precision: 4,
                    scale: 1,
                    default: 0,
                    comment: "育儿假（天）"
                },
                {
                    name: "marriageLeaveDays",
                    type: "decimal",
                    precision: 4,
                    scale: 1,
                    default: 0,
                    comment: "婚假（天）"
                },
                {
                    name: "paternityLeaveDays",
                    type: "decimal",
                    precision: 4,
                    scale: 1,
                    default: 0,
                    comment: "陪产假（天）"
                },
                {
                    name: "maternityLeaveDays",
                    type: "decimal",
                    precision: 4,
                    scale: 1,
                    default: 0,
                    comment: "产假（天）"
                },
                {
                    name: "bereavementLeaveDays",
                    type: "decimal",
                    precision: 4,
                    scale: 1,
                    default: 0,
                    comment: "丧假（天）"
                },
                {
                    name: "workInjuryLeaveDays",
                    type: "decimal",
                    precision: 4,
                    scale: 1,
                    default: 0,
                    comment: "工伤假（天）"
                },
                {
                    name: "homeVisitLeaveDays",
                    type: "decimal",
                    precision: 4,
                    scale: 1,
                    default: 0,
                    comment: "外派员工探亲假（天）"
                },
                // 考勤时间统计
                {
                    name: "totalLateMinutes",
                    type: "integer",
                    default: 0,
                    comment: "迟到时长（分钟）"
                },
                {
                    name: "totalEarlyLeaveMinutes",
                    type: "integer",
                    default: 0,
                    comment: "早退时长（分钟）"
                },
                {
                    name: "makeupCardCount",
                    type: "integer",
                    default: 0,
                    comment: "补卡次数"
                },
                {
                    name: "weekendOvertimeHours",
                    type: "decimal",
                    precision: 6,
                    scale: 2,
                    default: 0,
                    comment: "公休日加班（小时）"
                },
                {
                    name: "legalHolidayOvertimeHours",
                    type: "decimal",
                    precision: 6,
                    scale: 2,
                    default: 0,
                    comment: "法定假日加班（小时）"
                },
                // 补贴信息
                {
                    name: "businessTripNightAllowance",
                    type: "decimal",
                    precision: 10,
                    scale: 2,
                    default: 0,
                    comment: "上月出差宵夜补贴（元）"
                },
                {
                    name: "workingDayDutyAllowance",
                    type: "decimal",
                    precision: 10,
                    scale: 2,
                    default: 0,
                    comment: "上月工作日值班补贴（元）"
                },
                // 流程管理
                {
                    name: "confirmationStatus",
                    type: "enum",
                    enum: ["draft", "pending", "confirmed", "rejected", "locked"],
                    default: "'draft'",
                    comment: "确认状态"
                },
                {
                    name: "confirmationInitiatedAt",
                    type: "timestamp",
                    isNullable: true,
                    comment: "发起确认时间"
                },
                {
                    name: "confirmationCompletedAt",
                    type: "timestamp",
                    isNullable: true,
                    comment: "确认完成时间"
                },
                {
                    name: "confirmedBy",
                    type: "integer",
                    isNullable: true,
                    comment: "确认人ID"
                },
                {
                    name: "lastCalculatedAt",
                    type: "timestamp",
                    isNullable: true,
                    comment: "最后一次计算的时间"
                },
                // 其他信息
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
                    comment: "计算基础数据快照，用于审计"
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
                    default: "CURRENT_TIMESTAMP",
                    onUpdate: "CURRENT_TIMESTAMP",
                    comment: "更新时间"
                },
                {
                    name: "deletedAt",
                    type: "timestamp",
                    isNullable: true,
                    comment: "删除时间"
                }
            ],
            foreignKeys: [
                {
                    columnNames: ["employeeId"],
                    referencedTableName: "employees",
                    referencedColumnNames: ["id"],
                    onDelete: "CASCADE"
                }
            ]
        }), true);

        // 创建复合唯一索引
        await queryRunner.createIndex("attendance_monthly_reports", new TableIndex({
            name: "IDX_attendance_monthly_reports_employee_month",
            columnNames: ["employeeId", "reportMonth"],
            isUnique: true
        }));

        // 创建报告月份索引
        await queryRunner.createIndex("attendance_monthly_reports", new TableIndex({
            name: "IDX_attendance_monthly_reports_report_month",
            columnNames: ["reportMonth"]
        }));

        // 创建确认状态索引
        await queryRunner.createIndex("attendance_monthly_reports", new TableIndex({
            name: "IDX_attendance_monthly_reports_confirmation_status",
            columnNames: ["confirmationStatus"]
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 删除索引
        await queryRunner.dropIndex("attendance_monthly_reports", "IDX_attendance_monthly_reports_confirmation_status");
        await queryRunner.dropIndex("attendance_monthly_reports", "IDX_attendance_monthly_reports_report_month");
        await queryRunner.dropIndex("attendance_monthly_reports", "IDX_attendance_monthly_reports_employee_month");
        
        // 删除表
        await queryRunner.dropTable("attendance_monthly_reports");
    }

}
