import { sum, zip } from 'lodash-es';

export function _initMonths(startDate: Date, endDate: Date) {
    return Array(endDate.getMonth() - startDate.getMonth() + 1)
        .fill(startDate)
        .map((date, index) => ({
            date: new Date(date.getFullYear(), date.getMonth() + index, 1),
            value: index.toString(),
        }));
}

export function _flattenAndSumColumns(matrix: (number | null)[][]) {
    return zip(...matrix).map((column) => sum(column));
}

export function _flattenAndSubtractColumns(list: (number | null)[], list2: (number | null)[]) {
    return zip(list, list2).map(([a, b]) => (a || 0) - (b || 0));
}

export function _calculateOpeningAndClosingBalance(total: (number | null)[]) {
    const closingMemo = Array(total.length).fill(0);
    const openingBalance = [];
    const closingBalance = [];

    for (let i = 0; i < total.length; i++) {
        if (i === 0) {
            openingBalance.push(0);
            closingBalance.push(total[i]);
        } else {
            const opening = closingMemo[i - 1];
            openingBalance.push(opening);
            closingBalance.push(opening + total[i]);
        }

        closingMemo[i] = closingBalance[i];
    }

    return { openingBalance, closingBalance };
}

export function _generateEmptyValues(months: number) {
    return Array(months).fill(null);
}
