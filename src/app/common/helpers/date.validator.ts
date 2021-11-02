import { AbstractControl } from '@angular/forms';
import * as moment from 'moment';

export class DateValidator {
  static dateVaidator(AC: AbstractControl) {
    if (AC && AC.value && !moment(AC.value, 'MM/DD/YYYY HH:mm', true).isValid()) {
        console.log("Validator says: IS VALID");
      return { 'dateVaidator': true };
    }
    return null;
  }
}