import {Entity, PrimaryColumn, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity()
export class Certificate {
    @Column()
    @PrimaryColumn()
    @PrimaryGeneratedColumn()
    id: string
    @Column({type:'varchar',length:2000})
    raw: string
}






//
// interface GRADING_REPORT {
//     Measurements: string
//     Carat_Weight: string
//     Color_Grade: string
//     Clarity_Grade: string
//     Shape_And_Cutting_Style: string
//     Cut_Grade: string
// }
//
// interface PROPORTIONS {
//     Depth: string
//     Table: string
//     'CROWN HEIGHT - ANGLE': string
//     "PAVILION DEPTH - ANGLE": string
//
//     "GIRDLE THICKNESS" : string
//
//     CULET: string
// }
//
// interface FLUORESCENCE {
//     'FLUORESCENCE': string
// }
//
// interface FINISH {
//     'Polish': string
//
//     'Symmetry': string
// }
// interface INSCRIPTION {
//     "INSCRIPTION（S）: string
// }
//
// export class Certificate {
//     GRA_REPORT_NUMBER: string;
//
//     DESCRIPTION: string;
//
//     GRA_Laboratory_Area: string;
//
//     GRADING_REPORT: GRADING_REPORT
//
//     FINISH:
//
// }

