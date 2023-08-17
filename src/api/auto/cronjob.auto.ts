import cron from 'node-cron'
import { promoteStudents } from '../services/student.service'
/**
 * @method schedule
 * @param {string} schduleTime
 * @param {Function} callback @description Execute task
 *  */
cron.schedule('* * * * *', () => promoteStudents())
