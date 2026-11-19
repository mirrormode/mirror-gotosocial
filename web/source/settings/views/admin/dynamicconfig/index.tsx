/*
	GoToSocial
	Copyright (C) GoToSocial Authors admin@gotosocial.org
	SPDX-License-Identifier: AGPL-3.0-or-later

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import React, { useEffect } from "react";
import FormWithData from "../../../lib/form/form-with-data";
import { useDynamicConfigQuery, useUpdateDynamicConfigMutation } from "../../../lib/query/admin/dynamicconfig";
import type { DynamicConfig as DynamicConfigT} from "../../../lib/types/dynamicconfig";
import { useTextInput } from "../../../lib/form";
import useFormSubmit from "../../../lib/form/submit";
import MutationButton from "../../../components/form/mutation-button";
import { TextInput } from "../../../components/form/inputs";
import { useCronValidator } from "../../../lib/util/formvalidators";

export default function DynamicConfig() {
	return (
		<FormWithData
			dataQuery={useDynamicConfigQuery}
			DataForm={DynamicConfigForm}
		/>
	);
}

function DynamicConfigForm({ data: dConf }: { data: DynamicConfigT }) {
	
	// Prepare validators and human readable
	// strings for each cron form field.
	const [ ispcValidator, ispcHr ] = useCronValidator();
	const [ mccValidator, mccHr ] = useCronValidator();
	const [ sccValidator, sccHr ] = useCronValidator();

	const form = {
		instance_subscriptions_process_cron: useTextInput("instance_subscriptions_process_cron", { source: dConf, validator: ispcValidator }),
		media_cleanup_cron: useTextInput("media_cleanup_cron", { source: dConf , validator: mccValidator }),
		media_remote_cache_duration: useTextInput("media_remote_cache_duration", { source: dConf }),
		statuses_cleanup_cron: useTextInput("statuses_cleanup_cron", { source: dConf, validator: sccValidator }),
		statuses_cleanup_remote_older_than: useTextInput("statuses_cleanup_remote_older_than", { source: dConf }),
	};

	const [submitForm, result] = useFormSubmit(form, useUpdateDynamicConfigMutation());

	// Call all cron validate functions
	// to generate nice human readable strings.
	useEffect(() => {
		form.instance_subscriptions_process_cron.validate();
		form.media_cleanup_cron.validate();
		form.statuses_cleanup_cron.validate();
	}, [
		form.instance_subscriptions_process_cron,
		form.media_cleanup_cron,
		form.statuses_cleanup_cron,
	]);

	return (
		<form
			onSubmit={submitForm}
			autoComplete="none"
		>
			<h1>Server Configuration</h1>

			<div className="cron-input">
				<TextInput
					field={form.instance_subscriptions_process_cron}
					label="Instance subscriptions processing cron"
					className="monospace"
				/>
				<span>{ispcHr}</span>
			</div>

			<div className="cron-input">
				<TextInput
					field={form.media_cleanup_cron}
					label="Media cleanup cron"
					className="monospace"
				/>
				<span>{mccHr}</span>
			</div>

			<div className="cron-input">
				<TextInput
					field={form.statuses_cleanup_cron}
					label="Statuses cleanup cron"
					className="monospace"
				/>
				<span>{sccHr}</span>
			</div>
			<MutationButton label="Save" result={result} disabled={false} />
		</form>
	);
}
