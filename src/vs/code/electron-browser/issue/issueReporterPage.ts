/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { escape } from 'vs/base/common/strings';
import { localize } from 'vs/nls';

export default (): string => `
<div id="issue-reporter">
	<div id="english" class="input-group hidden">${escape(localize('completeInEnglish', "Please complete the form in English."))}</div>

	<div class="section">
		<div class="input-group">
			<label class="inline-label" for="issue-type">${escape(localize('issueTypeLabel', "This is a"))}</label>
			<select id="issue-type" class="inline-form-control">
				<!-- To be dynamically filled -->
			</select>
		</div>

		<div class="input-group" id="problem-source">
			<label class="inline-label" for="issue-source">${escape(localize('issueSourceLabel', "File on"))}</label>
			<select id="issue-source" class="inline-form-control">
				<!-- {{ SQL CARBON EDIT }} -->
				<option value="false">${escape(localize('sqlops', "SQL Operations Studio"))}</option>
				<option value="true">${escape(localize('extension', "An Extension"))}</option>
			</select>
			<div id="problem-source-help-text" class="instructions">${escape(localize('disableExtensionsLabelText', "Try to reproduce the problem after {0}. If the problem only reproduces when extensions are active, it is likely an issue with an extension."))
		.replace('{0}', `<span tabIndex=0 role="button" id="disableExtensions" class="workbenchCommand">${escape(localize('disableExtensions', "disabling all extensions and reloading the window"))}</span>`)}
			</div>

			<div id="extension-selection">
				<label class="inline-label" for="extension-selector">${escape(localize('chooseExtension', "Extension"))} <span class="required-input">*</span></label>
				<select id="extension-selector" class="inline-form-control">
					<!-- To be dynamically filled -->
				</select>
			</div>
		</div>

		<div class="input-group">
			<label class="inline-label" for="issue-title">${escape(localize('issueTitleLabel', "Title"))} <span class="required-input">*</span></label>
			<input id="issue-title" type="text" class="inline-form-control" placeholder="${escape(localize('issueTitleRequired', "Please enter a title."))}" required>
			<div id="issue-title-length-validation-error" class="validation-error hidden" role="alert">${escape(localize('titleLengthValidation', "The title is too long."))}</div>
			<small id="similar-issues">
				<!-- To be dynamically filled -->
			</small>
		</div>

	</div>

	<div class="system-info" id="block-container">
		<div class="block block-system">
			<details>
				<summary>${escape(localize('systemInfo', "My System Info"))}
					<div class="include-data">
						<input class="sendData" type="checkbox" id="includeSystemInfo" checked/>
						<label class="caption" for="includeSystemInfo">${escape(localize('sendData', "Send my data"))}</label>
					</div>
				</summary>
				<div class="block-info">
					<!-- To be dynamically filled -->
				</div>
			</details>
		</div>
		<div class="block block-process">
			<details>
				<summary>${escape(localize('processes', "Currently Running Processes"))}
					<div class="include-data">
						<input class="sendData"  type="checkbox" id="includeProcessInfo" checked/>
						<label class="caption" for="includeProcessInfo">${escape(localize('sendData', "Send my data"))}</label>
					</div>
				</summary>
				<pre class="block-info">
					<!-- To be dynamically filled -->
				</pre>
			</details>
		</div>
		<div class="block block-workspace">
			<details>
				<summary>${escape(localize('workspaceStats', "My Workspace Stats"))}
					<div class="include-data">
						<input class="sendData"  type="checkbox" id="includeWorkspaceInfo" checked/>
						<label class="caption" for="includeWorkspaceInfo">${escape(localize('sendData', "Send my data"))}</label>
					</div>
				</summary>
				<pre class="block-info">
					<code>
						<!-- To be dynamically filled -->
					</code>
				</pre>
			</details>
		</div>
		<div class="block block-extensions">
			<details>
				<summary>${escape(localize('extensions', "My Extensions"))}
					<div class="include-data">
						<input class="sendData"  type="checkbox" id="includeExtensions" checked/>
						<label class="caption" for="includeExtensions">${escape(localize('sendData', "Send my data"))}</label>
					</div>
				</summary>
				<div class="block-info">
					<!-- To be dynamically filled -->
				</div>
			</details>
		</div>
		<div class="block block-searchedExtensions">
			<details>
				<summary>${escape(localize('searchedExtensions', "Searched Extensions"))}
					<div class="include-data">
						<input class="sendData"  type="checkbox" id="includeSearchedExtensions" checked/>
						<label class="caption" for="includeSearchedExtensions">${escape(localize('sendData', "Send my data"))}</label>
					</div>
				</summary>
				<div class="block-info">
					<!-- To be dynamically filled -->
				</div>
			</details>
		</div>
		<div class="block block-settingsSearchResults">
			<details>
				<summary>${escape(localize('settingsSearchDetails', "Settings Search Details"))}
					<div class="include-data">
						<input class="sendData"  type="checkbox" id="includeSettingsSearchDetails" checked/>
						<label class="caption" for="includeSettingsSearchDetails">${escape(localize('sendData', "Send my data"))}</label>
					</div>
				</summary>
				<div class="block-info">
					<!-- To be dynamically filled -->
				</div>
			</details>
		</div>
	</div>

	<div class="input-group description-section">
		<label for="description" id="issue-description-label">
			<!-- To be dynamically filled -->
		</label>
		<div class="instructions" id="issue-description-subtitle">
			<!-- To be dynamically filled -->
		</div>
		<div class="block-info-text">
			<textarea name="description" id="description" placeholder="${escape(localize('details', "Please enter details."))}" required></textarea>
		</div>
	</div>

	<button id="github-submit-btn" disabled>${escape(localize('loadingData', "Loading data..."))}</button>
</div>`;