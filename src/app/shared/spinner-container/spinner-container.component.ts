import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { LoadingSpinnerService } from './../../services/loading-spinner.service';

@Component({
  selector: 'app-spinner-container',
  templateUrl: './spinner-container.component.html',
  styleUrls: ['./spinner-container.component.css']
})
export class SpinnerContainerComponent implements OnInit {
  @Input() name: string;
  @Input() loadingImage: string;

  private isShowing = false;

  constructor(private spinnerService: LoadingSpinnerService) { }

  @Input()
  get show(): boolean {
    return this.isShowing;
  }

  @Output() showChange = new EventEmitter();

  set show(val: boolean) {
    this.isShowing = val;
    this.showChange.emit(this.isShowing);
  }
  
  ngOnInit() {
    if (!this.name) throw new Error('Spinner must have a "name" attribute.');

    this.spinnerService._register(this);
  }

  ngOnDestroy(): void {
    this.spinnerService._unregister(this);
  }

}
