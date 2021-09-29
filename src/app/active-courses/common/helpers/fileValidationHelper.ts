
export function requiredFileTypes(file: File): boolean {
    console.log("I am inside the validator");
    if (file.name.endsWith('.csv')) {
      return true;
    } else if (file.name.endsWith('.xlsx')) {
      return true;
    } else {
      return false;
    }
  }