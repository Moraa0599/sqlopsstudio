/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { DragCellSelectionModel } from 'sql/base/browser/ui/table/plugins/dragCellSelectionModel.plugin';
import { attachTableStyler } from 'sql/common/theme/styler';
import QueryRunner from 'sql/parts/query/execution/queryRunner';
import { VirtualizedCollection,AsyncDataProvider } from 'sql/base/browser/ui/table/asyncDataView';
import { Table, ITableStyles } from 'sql/base/browser/ui/table/table';

import * as sqlops from 'sqlops';

import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { Emitter, Event } from 'vs/base/common/event';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ViewletPanel, IViewletPanelOptions } from 'vs/workbench/browser/parts/views/panelViewlet';
import { isArray } from 'vs/base/common/types';
import { range } from 'vs/base/common/arrays';
import { Orientation, IView } from 'vs/base/browser/ui/splitview/splitview';
import { Disposable, IDisposable, dispose } from 'vs/base/common/lifecycle';
import { $ } from 'vs/base/browser/builder';
import { ScrollableSplitView } from 'sql/base/browser/ui/scrollableSplitview/scrollableSplitview';
import { MouseWheelSupport } from '../../../base/browser/ui/table/plugins/mousewheelTableScroll.plugin';

const rowHeight = 29;
const minGridHeightInRows = 8;

export class GridPanel extends ViewletPanel {
	private container = document.createElement('div');
	private splitView: ScrollableSplitView;
	private tables: GridTable[] = [];
	private tableDisposable: IDisposable[] = [];

	public runner: QueryRunner;

	constructor(
		title: string, options: IViewletPanelOptions,
		@IKeybindingService keybindingService: IKeybindingService,
		@IContextMenuService contextMenuService: IContextMenuService,
		@IConfigurationService configurationService: IConfigurationService,
		@IThemeService private themeService: IThemeService
	) {
		super(title, options, keybindingService, contextMenuService, configurationService);
		this.splitView = new ScrollableSplitView(this.container);
	}

	protected renderBody(container: HTMLElement): void {
		this.container.style.width = '100%';
		this.container.style.height = '100%';

		container.appendChild(this.container);
	}

	protected layoutBody(size: number): void {
		this.splitView.layout(size);
	}

	public onResultSet(resultSet: sqlops.ResultSetSummary | sqlops.ResultSetSummary[]) {
		if (isArray(resultSet)) {
			resultSet.forEach(c => {
				let table = new GridTable(this.runner, c);
				this.tableDisposable.push(attachTableStyler(table, this.themeService));
				this.splitView.addView(table, 1, this.splitView.length);
				this.tables.push(table);
			});
		} else {
			let table = new GridTable(this.runner, resultSet);
			this.tableDisposable.push(attachTableStyler(table, this.themeService));
			this.splitView.addView(table, 1, this.splitView.length);
			this.tables.push(table);
		}

		this.maximumBodySize = this.tables.reduce((p, c) => {
			return p + c.maximumSize;
		}, 0);
	}

	public reset() {
		for (let i = this.splitView.length - 1; i >= 0; i--) {
			this.splitView.removeView(i);
		}
		dispose(this.tables);
		this.tables = [];
	}
}

class GridTable extends Disposable implements IView {
	private table: Table<any>;
	private container = document.createElement('div');

	private _onDidChange = new Emitter<number>();
	public readonly onDidChange: Event<number> = this._onDidChange.event;

	constructor(private runner: QueryRunner, private resultSet: sqlops.ResultSetSummary) {
		super();
		this.container.style.width = '100%';
		this.container.style.height = '100%';
		let collection = new VirtualizedCollection(50, resultSet.rowCount, (offset, count) => {
			return this.loadData(offset, count);
		}, index => {
			return this.placeholdGenerator(index);
		});
		collection.setCollectionChangedCallback((change, startIndex, count) => {
			this.renderGridDataRowsRange(startIndex, count);
		});
		let columns = resultSet.columnInfo.map<Slick.Column<any>>((c, i) => {
			return {
				id: i.toString(),
				name: c.columnName,
				field: i.toString(),
				width: 100
			};
		});
		let dataProvider = new AsyncDataProvider(collection, columns);
		this.table = this._register(new Table(this.container, { dataProvider, columns }, { rowHeight, showRowNumber: true }));
		this.table.setSelectionModel(new DragCellSelectionModel());
		this.table.registerPlugin(new MouseWheelSupport());
	}

	public render(container: HTMLElement, orientation: Orientation): void {
		container.appendChild(this.container);
	}

	public layout(size: number): void {
		this.table.layout(size, Orientation.VERTICAL);
	}

	public get minimumSize(): number {
		let smallestRows = (this.resultSet.rowCount + 1) * rowHeight;
		let smallestSize = minGridHeightInRows * rowHeight;
		return Math.min(smallestRows, smallestSize);
	}

	public get maximumSize(): number {
		return (this.resultSet.rowCount + 1) * rowHeight;
	}

	private loadData(offset: number, count: number): Thenable<any[]> {
		return this.runner.getQueryRows(offset, count, this.resultSet.batchId, this.resultSet.id).then(response => {
			let rows = response.resultSubset;
			return rows.rows.map(r => {
				return {
					values: r.map(c => {
						return c.displayValue;
					})
				};
			});
		});
	}

	private placeholdGenerator(index: number): any {
		return { values: [] };
	}

	private renderGridDataRowsRange(startIndex: number, count: number): void {
		// let editor = this.table.getCellEditor();
		// let oldValue = editor ? editor.getValue() : undefined;
		// let wasValueChanged = editor ? editor.isValueChanged() : false;
		this.invalidateRange(startIndex, startIndex + count);
		// let activeCell = this._grid.getActiveCell();
		// if (editor && activeCell.row >= startIndex && activeCell.row < startIndex + count) {
		//     if (oldValue && wasValueChanged) {
		//         editor.setValue(oldValue);
		//     }
		// }
	}

	private invalidateRange(start: number, end: number): void {
		let refreshedRows = range(start, end);
		if (this.table) {
			this.table.invalidateRows(refreshedRows, true);
		}
	}

	public style(styles: ITableStyles) {
		this.table.style(styles);
	}

	public dispose() {
		$(this.container).destroy();
		super.dispose();
	}
}
