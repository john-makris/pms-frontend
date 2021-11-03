export class SelectionHelper {

    static objectComparisonFunction(selectedOption: any, valueOfSelect: any ): boolean {
        return selectedOption.id === valueOfSelect.id;
    }
}