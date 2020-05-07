export class DataGridClearingManager {
    private gridClicked = false;
    private containerClicked = false;
    private scrollContainerClicked = false;

    get isDirty(): boolean {
        // the grid handles any clearing itself through cell events
        if (this.gridClicked) {
            return false;
        }

        // clicked on space between grid and scrollbars
        if (this.containerClicked) {
            return true;
        }

        // clicked on scrollbar
        if (this.scrollContainerClicked) {
            return false;
        }

        // clicked outside the component
        return true;
    }

    clickGrid(): void {
        this.gridClicked = true;
    }

    clickContainer(): void {
        this.containerClicked = true;
    }

    clickScrollContainer(): void {
        this.scrollContainerClicked = true;
    }

    clear(): void {
        this.gridClicked = false;
        this.containerClicked = false;
        this.scrollContainerClicked = false;
    }
}
