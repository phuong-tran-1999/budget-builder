import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    inject,
    OnInit,
    viewChild,
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTable, MatTableModule } from '@angular/material/table';
import { sum, zip } from 'lodash-es';
import { NgxMaskDirective } from 'ngx-mask';
import { combineLatest, debounceTime, forkJoin, startWith, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TypeSafeMatCellDefDirective } from '@modules/shared/core';

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
    table = viewChild('table', { read: MatTable });
    /* Initial values */
    currentYear = new Date().getFullYear();
    initialStartPeriod = new Date(this.currentYear, 0, 1);
    initialEndPeriod = new Date(this.currentYear, 2, 31);
    initialMonths = this._initMonths(this.initialStartPeriod, this.initialEndPeriod);
    initialMonthValues = this.initialMonths.map((item) => item.value);

    initialIncomeGroups: CategoryGroup[] = [
        {
            name: 'General Income',
            items: ['Sales', 'Commission'],
        },
    ];
    initialExpenseGroups: CategoryGroup[] = [
        {
            name: 'Operational Expenses',
            items: ['Management Fees', 'Cloud Hosting'],
        },
    ];

    /* Injectables */
    _fb = inject(FormBuilder);
    _cdr = inject(ChangeDetectorRef);
    _destroyRef = inject(DestroyRef);

    /* Public properties */
    form = this._initForm();
    dataSource = this._flattenFormControls();
    displayedColumns: string[] = ['category', ...this.initialMonthValues];

    /* Public methods */
    addCategory(array: FormArray) {
        array.push(this._initCategoryForm('', this.initialMonthValues));
        this.dataSource = this._flattenFormControls();
    }

    addGroup() {
        const formGroup = this._initCategoryGroupForm(this.initialExpenseGroups[0], this.initialMonthValues);
        this.form.controls.groups.push(formGroup);
        this.dataSource = this._flattenFormControls();
    }

    addGroup2(type: 'income' | 'expense') {
        console.log('addGroup2', type);
    }

    // getTotal(index: number) {
    //     const studentGrades = this.gradeFields.value[ind].grades;

    //     return studentGrades.reduce((a, b) => Number(a) + Number(b));
    // }

    /* Form Related Methods */
    _initForm() {
        const subtotalChangedList = [];
        const groups = [];

        for (const group of this.initialExpenseGroups) {
            const groupForm = this._initCategoryGroupForm(group, this.initialMonthValues);
            const subTotalForm = groupForm.controls.subTotals;
            groups.push(groupForm);
            subtotalChangedList.push(subTotalForm.valueChanges.pipe(startWith(subTotalForm.value)));
        }

        const form = this._fb.group({
            startPeriod: [null, Validators.required],
            groups: this._fb.array(groups),
            total: this._initMonthForm(this.initialMonthValues),
        });

        combineLatest(subtotalChangedList)
            .pipe(debounceTime(200), takeUntilDestroyed(this._destroyRef))
            .subscribe((amounts) => {
                const subTotals = this._flattenAndSumColumns(amounts);
                form.controls.total.setValue(subTotals);
                this._updateTable();
                this._cdr.markForCheck();
            });

        return form;
    }

    _initMonthForm(months: string[]) {
        return this._fb.array<null | number>(months.map(() => null));
    }

    _initCategoryForm(name = '', months: string[]) {
        return this._fb.group({
            name: [name],
            amounts: this._initMonthForm(months),
        });
    }

    _initCategoryGroupForm(group: CategoryGroup, months: string[]) {
        const categories = [];
        const amountChangedList = [];

        for (const category of group.items) {
            const categoryForm = this._initCategoryForm(category, months);
            const amountForm = categoryForm.controls.amounts;
            categories.push(categoryForm);
            amountChangedList.push(amountForm.valueChanges.pipe(startWith(amountForm.value)));
        }

        const form = this._fb.group({
            name: [group.name],
            categories: this._fb.array(categories),
            subTotals: this._initMonthForm(months),
        });

        combineLatest(amountChangedList)
            .pipe(debounceTime(200), takeUntilDestroyed(this._destroyRef))
            .subscribe((amounts) => {
                const subTotals = this._flattenAndSumColumns(amounts);
                form.controls.subTotals.setValue(subTotals);
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

    _flattenFormControls() {
        const flattened = [];

        for (let i = 0; i < this.form.controls.groups.controls.length; i++) {
            const group = this.form.controls.groups.controls[i];

            flattened.push({ name: group.controls.name, type: 'categoryGroup' as const });

            for (let j = 0; j < group.controls.categories.controls.length; j++) {
                const category = group.controls.categories.controls[j];

                flattened.push({
                    name: category.controls.name,
                    amounts: category.controls.amounts,
                    categories: group.controls.categories,
                    type: 'category' as const,
                });
            }

            flattened.push({ subTotals: group.controls.subTotals, type: 'subTotals' as const });
        }

        console.log('_flattenFormControls', flattened);

        return flattened;
    }

    _updateTable() {
        if (!this.table()) return;

        this.table()?.renderRows();
    }

    _trackByIndex(index: number) {
        return index;
    }
}
