import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { TypeSafeMatCellDefDirective } from '@modules/shared/core';
import { sum, zip } from 'lodash-es';
import { NgxMaskDirective } from 'ngx-mask';
import { combineLatest, debounceTime, map, startWith } from 'rxjs';

export interface CategoryGroup {
    name: string;
    items: string[];
}

@Component({
    selector: 'bb-home',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatTableModule,
        ReactiveFormsModule,
        NgxMaskDirective,
        TypeSafeMatCellDefDirective,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
    /* Initial values */
    currentYear = new Date().getFullYear();
    initialStartPeriod = new Date(this.currentYear, 0, 1);
    initialEndPeriod = new Date(this.currentYear, 11, 31);
    initialMonths = this._initMonths(this.initialStartPeriod, this.initialEndPeriod);
    initialMonthValues = this.initialMonths.map((item) => item.value);

    initGroup: CategoryGroup = { name: '', items: [''] };
    initialIncomeGroups: CategoryGroup[] = [];
    initialExpenseGroups: CategoryGroup[] = [];

    /* Injectables */
    _fb = inject(FormBuilder);
    _cdr = inject(ChangeDetectorRef);
    _destroyRef = inject(DestroyRef);

    /* Public properties */
    form = this._initForm();
    displayedColumns: string[] = ['category', ...this.initialMonthValues];

    /* Public methods */
    addCategory(array: FormArray) {
        array.push(this._initCategoryForm('', this.initialMonthValues));
    }

    addGroup(type: 'income' | 'expense') {
        this.form.controls[type].controls.groups.push(
            this._initCategoryGroupForm(this.initialMonthValues, this.initGroup),
        );
    }

    /* Form Related Methods */
    _initForm() {
        const incomeGroups = [];
        const expenseGroups = [];

        for (const group of this.initialExpenseGroups) {
            const groupForm = this._initCategoryGroupForm(this.initialMonthValues, group);
            expenseGroups.push(groupForm);
        }

        for (const group of this.initialIncomeGroups) {
            const groupForm = this._initCategoryGroupForm(this.initialMonthValues, group);
            incomeGroups.push(groupForm);
        }

        const form = this._fb.group({
            income: this._fb.group({
                groups: this._fb.array(incomeGroups),
                total: this._initMonthForm(this.initialMonthValues),
            }),
            expense: this._fb.group({
                groups: this._fb.array(expenseGroups),
                total: this._initMonthForm(this.initialMonthValues),
            }),
            total: this._initMonthForm(this.initialMonthValues),
            openingBalance: this._initMonthForm(this.initialMonthValues),
            closingBalance: this._initMonthForm(this.initialMonthValues),
        });

        const { income, expense, total, openingBalance, closingBalance } = form.controls;
        const { groups: iGroups, total: iTotal } = income.controls;
        const { groups: eGroups, total: eTotal } = expense.controls;

        iGroups.valueChanges
            .pipe(
                debounceTime(150),
                map((groups) =>
                    this._flattenAndSumColumns(groups.map((group) => group.subtotals).filter((item) => !!item)),
                ),
                takeUntilDestroyed(this._destroyRef),
            )
            .subscribe((total) => {
                iTotal.setValue(total);
            });

        eGroups.valueChanges
            .pipe(
                debounceTime(150),
                map((groups) =>
                    this._flattenAndSumColumns(groups.map((group) => group.subtotals).filter((item) => !!item)),
                ),
                takeUntilDestroyed(this._destroyRef),
            )
            .subscribe((total) => {
                eTotal.setValue(total);
            });

        combineLatest([
            iTotal.valueChanges.pipe(startWith(iTotal.value)),
            eTotal.valueChanges.pipe(startWith(eTotal.value)),
        ])
            .pipe(
                map(([iTotal, eTotal]) => this._flattenAndSubtractColumns(iTotal, eTotal)),
                takeUntilDestroyed(this._destroyRef),
            )
            .subscribe((result) => {
                total.patchValue(result);
                this._cdr.markForCheck();
            });

        // Calculate opening balance
        // combineLatest([
        //     total.valueChanges.pipe(startWith(total.value)),
        //     openingBalance.valueChanges.pipe(startWith(openingBalance.value)),
        // ]);

        return form;
    }

    _initMonthForm(months: string[]) {
        return this._fb.array<null | number>(months.map(() => null));
    }

    _initCategoryForm(name = '', months: string[]) {
        return this._fb.group({
            name: [name, { updateOn: 'submit' }],
            amounts: this._initMonthForm(months),
        });
    }

    _initCategoryGroupForm(months: string[], group: CategoryGroup) {
        const categories = [];

        for (const category of group.items) {
            const categoryForm = this._initCategoryForm(category, months);
            categories.push(categoryForm);
        }

        const form = this._fb.group({
            name: [group.name],
            categories: this._fb.array(categories),
            subtotals: this._initMonthForm(months),
        });

        form.controls.categories.valueChanges
            .pipe(
                debounceTime(150),
                map((categories) =>
                    this._flattenAndSumColumns(categories.map((category) => category.amounts).filter((item) => !!item)),
                ),
                takeUntilDestroyed(this._destroyRef),
            )
            .subscribe((value) => {
                form.controls.subtotals.patchValue(value);
            });

        return form;
    }

    /* Helper Methods */
    _initMonths(startDate: Date, endDate: Date) {
        return Array(endDate.getMonth() - startDate.getMonth() + 1)
            .fill(startDate)
            .map((date, index) => ({
                date: new Date(date.getFullYear(), date.getMonth() + index, 1),
                value: index.toString(),
            }));
    }

    _flattenAndSumColumns(matrix: (number | null)[][]) {
        return zip(...matrix).map((column) => sum(column));
    }

    _flattenAndSubtractColumns(list: (number | null)[], list2: (number | null)[]) {
        return zip(list, list2).map(([a, b]) => (a || 0) - (b || 0));
    }

    _trackByIndex(index: number) {
        return index;
    }
}
