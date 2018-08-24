import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataGridComponent } from '../data-grid.component';

describe('DataGridComponent', () => {
    let component: DataGridComponent;
    let fixture: ComponentFixture<DataGridComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DataGridComponent]
        })
            .compileComponents().catch(
                err => { throw err; }
            );
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DataGridComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    xit('should create', () => {
        expect(component).toBeTruthy();
    });
});
