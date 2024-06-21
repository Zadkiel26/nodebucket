/**
 * Title: employee.interface.ts
 * Author: Zadkiel Rodriguez Alvarado
 * Date: 6/19/2024
 * Description: Employee Interface
 */
import { Task } from "./task.interface";

export interface Employee {
  empId: number;
  todo: Array<Task>;
  doing: Array<Task>;
  done: Array<Task>;
}