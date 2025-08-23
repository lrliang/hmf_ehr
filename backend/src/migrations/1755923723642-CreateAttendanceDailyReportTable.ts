import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateAttendanceDailyReportTable1755923723642 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 创建attendance_daily_reports表
        await queryRunner.createTable(new Table({
            name: "attendance_daily_reports",
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
                    name: "reportDate",
                    type: "date",
                    isNullable: false,
                    comment: "报告日期"
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
                {
                    name: "companyEmail",
                    type: "varchar",
                    length: "100",
                    isNullable: true,
                    comment: "公司邮箱"
                },
                {
                    name: "primaryDepartment",
                    type: "varchar",
                    length: "100",
                    isNullable: true,
                    comment: "一级部门"
                },
                // 打卡时间信息
                {
                    name: "firstCheckIn",
                    type: "timestamp",
                    isNullable: true,
                    comment: "当天第一次打卡时间"
                },
                {
                    name: "lastCheckOut",
                    type: "timestamp",
                    isNullable: true,
                    comment: "当天最后一次打卡时间"
                },
                {
                    name: "dailyAttendanceStatus",
                    type: "varchar",
                    length: "50",
                    isNullable: true,
                    comment: "当天出勤状态：正常、迟到、早退、缺勤等"
                },
                // 假期和节假日
                {
                    name: "legalHolidayDays",
                    type: "decimal",
                    precision: 3,
                    scale: 1,
                    default: 0,
                    comment: "法定假日天数"
                },
                {
                    name: "makeupCardCount",
                    type: "integer",
                    default: 0,
                    comment: "补卡次数"
                },
                // 各种假期天数
                {
                    name: "annualLeaveDays",
                    type: "decimal",
                    precision: 3,
                    scale: 1,
                    default: 0,
                    comment: "年假（天）"
                },
                {
                    name: "personalLeaveDays",
                    type: "decimal",
                    precision: 3,
                    scale: 1,
                    default: 0,
                    comment: "事假（天）"
                },
                {
                    name: "sickLeaveDays",
                    type: "decimal",
                    precision: 3,
                    scale: 1,
                    default: 0,
                    comment: "病假（天）"
                },
                {
                    name: "bereavementLeaveDays",
                    type: "decimal",
                    precision: 3,
                    scale: 1,
                    default: 0,
                    comment: "丧假（天）"
                },
                {
                    name: "childcareLeaveDays",
                    type: "decimal",
                    precision: 3,
                    scale: 1,
                    default: 0,
                    comment: "育儿假（天）"
                },
                {
                    name: "maternityLeaveWorkingDays",
                    type: "decimal",
                    precision: 3,
                    scale: 1,
                    default: 0,
                    comment: "产假工作日（天）"
                },
                // 加班时间统计
                {
                    name: "weekendOvertimeHours",
                    type: "decimal",
                    precision: 5,
                    scale: 2,
                    default: 0,
                    comment: "公休日加班（小时）"
                },
                {
                    name: "legalHolidayOvertimeHours",
                    type: "decimal",
                    precision: 5,
                    scale: 2,
                    default: 0,
                    comment: "法定假日加班（小时）"
                },
                {
                    name: "lateMinutes",
                    type: "integer",
                    default: 0,
                    comment: "迟到时长（分钟）"
                },
                {
                    name: "calculationMessage",
                    type: "text",
                    isNullable: true,
                    comment: "计算过程中的消息或异常信息"
                },
                {
                    name: "calculationStatus",
                    type: "enum",
                    enum: ["success", "failed", "pending", "processing"],
                    default: "'pending'",
                    comment: "计算状态"
                },
                {
                    name: "paternityLeaveWorkingDays",
                    type: "decimal",
                    precision: 4,
                    scale: 1,
                    default: 0,
                    comment: "陪产假工作日天数"
                },
                {
                    name: "shift",
                    type: "varchar",
                    length: "50",
                    isNullable: true,
                    comment: "工作班次"
                },
                {
                    name: "businessTripHours",
                    type: "decimal",
                    precision: 5,
                    scale: 2,
                    default: 0,
                    comment: "公出时长（小时）"
                },
                {
                    name: "actualWorkingHours",
                    type: "decimal",
                    precision: 5,
                    scale: 2,
                    isNullable: true,
                    comment: "实际工作时长（小时）"
                },
                {
                    name: "overtimeHours",
                    type: "decimal",
                    precision: 5,
                    scale: 2,
                    default: 0,
                    comment: "加班时长（小时）"
                },
                {
                    name: "earlyLeaveMinutes",
                    type: "integer",
                    default: 0,
                    comment: "早退时长（分钟）"
                },
                {
                    name: "isAbsent",
                    type: "boolean",
                    default: false,
                    comment: "是否缺勤"
                },
                {
                    name: "lastCalculatedAt",
                    type: "timestamp",
                    isNullable: true,
                    comment: "最后一次计算的时间"
                },
                {
                    name: "remark",
                    type: "text",
                    isNullable: true,
                    comment: "备注信息"
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
        await queryRunner.createIndex("attendance_daily_reports", new TableIndex({
            name: "IDX_attendance_daily_reports_employee_date",
            columnNames: ["employeeId", "reportDate"],
            isUnique: true
        }));

        // 创建报告日期索引
        await queryRunner.createIndex("attendance_daily_reports", new TableIndex({
            name: "IDX_attendance_daily_reports_report_date",
            columnNames: ["reportDate"]
        }));

        // 创建计算状态索引
        await queryRunner.createIndex("attendance_daily_reports", new TableIndex({
            name: "IDX_attendance_daily_reports_calculation_status",
            columnNames: ["calculationStatus"]
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 删除索引
        await queryRunner.dropIndex("attendance_daily_reports", "IDX_attendance_daily_reports_calculation_status");
        await queryRunner.dropIndex("attendance_daily_reports", "IDX_attendance_daily_reports_report_date");
        await queryRunner.dropIndex("attendance_daily_reports", "IDX_attendance_daily_reports_employee_date");
        
        // 删除表
        await queryRunner.dropTable("attendance_daily_reports");
    }

}
