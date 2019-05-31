/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as nls from 'vs/nls';
import { BaseBinaryResourceEditor } from 'vs/workbench/browser/parts/editor/binaryEditor';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IWindowsService } from 'vs/platform/windows/common/windows';
import { EditorInput, EditorOptions } from 'vs/workbench/common/editor';
import { FileEditorInput } from 'vs/workbench/contrib/files/common/editors/fileEditorInput';
import { URI } from 'vs/base/common/uri';
import { BINARY_FILE_EDITOR_ID } from 'vs/workbench/contrib/files/common/files';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IFileService } from 'vs/platform/files/common/files';

/**
 * An implementation of editor for binary files like images.
 */
export class BinaryFileEditor extends BaseBinaryResourceEditor {

	static readonly ID = BINARY_FILE_EDITOR_ID;

	constructor(
		@ITelemetryService telemetryService: ITelemetryService,
		@IThemeService themeService: IThemeService,
		@IWindowsService private readonly windowsService: IWindowsService,
		@IEditorService private readonly editorService: IEditorService,
		@IStorageService storageService: IStorageService,
		@IFileService fileService: IFileService,
		@IWorkbenchEnvironmentService environmentService: IWorkbenchEnvironmentService,
	) {
		super(
			BinaryFileEditor.ID,
			{
				openInternal: (input, options) => this.openInternal(input, options),
				openExternal: resource => this.openExternal(resource)
			},
			telemetryService,
			themeService,
			fileService,
			environmentService,
			storageService,
		);
	}

	private async openInternal(input: EditorInput, options: EditorOptions): Promise<void> {
		if (input instanceof FileEditorInput) {
			input.setForceOpenAsText();

			await this.editorService.openEditor(input, options, this.group);
		}
	}

	private async openExternal(resource: URI): Promise<void> {
		const didOpen = await this.windowsService.openExternal(resource.toString());
		if (!didOpen) {
			return this.windowsService.showItemInFolder(resource);
		}
	}

	getTitle(): string | null {
		return this.input ? this.input.getName() : nls.localize('binaryFileEditor', "Binary File Viewer");
	}
}
