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

	const [submitForm, result] = useFormSubmit(form, useUpdateDynamicConfigMutation(), {
		changedOnly: true,
		// Durations can come back slightly different
		// from what the user input (eg., 3 week vs 3 weeks),
		// so on mutation set form values to what was returned.
		onFinish: ({ data }) => {
			if (data) {
				form.media_remote_cache_duration.setter(data.media_remote_cache_duration);
				form.statuses_cleanup_remote_older_than.setter(data.statuses_cleanup_remote_older_than);
			}
		}
	});

	// On render call all cron validate functions
	// to generate human readable strings already.
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
			className="server-configuration"
			onSubmit={submitForm}
			autoComplete="none"
		>
			<div className="form-section-docs">
				<h1>Server Configuration</h1>
				<p>
					On this page you can set various configuration options
					related to the operation of the server: caching, scheduling, etc.
				</p>
				<div className="info">
					<i className="fa fa-fw fa-info-circle" aria-hidden="true"></i>
					<b>
						This page is a work in progress.<br/>More options will be added here in future
						versions of GoToSocial as dynamic config is migrated from the config.yaml file.
					</b>
				</div>
			</div>

			<div className="form-section-docs">
				<p>
					Instance: <a href="/settings/moderation/domain-permissions/subscriptions/search">domain permission subscriptions</a> processing.
				</p>
			</div>

			<div className="cron-input">
				<TextInput
					field={form.instance_subscriptions_process_cron}
					label="Instance subscriptions processing cron"
					className="monospace"
				/>
				<span className="cron-hr">{ispcHr}</span>
			</div>

			<div className="form-section-docs">
				<p>
					Media: caching and cleanup.
				</p>
				<a
					href="https://docs.gotosocial.org/en/stable/admin/media_caching/#cleanup"
					target="_blank"
					className="docslink"
					rel="noreferrer"
				>
					Learn more about media caching and cleanup (opens in a new tab)
				</a>
			</div>

			<div className="cron-input">
				<TextInput
					field={form.media_cleanup_cron}
					label="Media cleanup cron"
					className="monospace"
				/>
				<span className="cron-hr">{mccHr}</span>
			</div>

			<div>
				<TextInput
					field={form.media_remote_cache_duration}
					label="Media remote cache duration"
				/>
				<span>0 sec = cache forever</span>
			</div>

			<div className="form-section-docs">
				<p>
					Statuses: remote status caching and pruning.
				</p>
				<a
					href="https://docs.gotosocial.org/en/stable/admin/post_caching/"
					target="_blank"
					className="docslink"
					rel="noreferrer"
				>
					Learn more about status caching and pruning (opens in a new tab)
				</a>
			</div>

			<div className="cron-input">
				<TextInput
					field={form.statuses_cleanup_cron}
					label="Statuses cleanup cron"
					className="monospace"
				/>
				<span className="cron-hr">{sccHr}</span>
			</div>

			<div>
				<TextInput
					field={form.statuses_cleanup_remote_older_than}
					label="Statuses cleanup remote older than"
				/>
				<span>0 sec = no cleanup</span>
			</div>

			<MutationButton
				label="Save"
				result={result}
				disabled={
					!(
						(form.instance_subscriptions_process_cron.valid && form.instance_subscriptions_process_cron.hasChanged()) ||
						(form.media_cleanup_cron.valid && form.media_cleanup_cron.hasChanged()) ||
						(form.media_remote_cache_duration.valid && form.media_remote_cache_duration.hasChanged()) ||
						(form.statuses_cleanup_cron.valid && form.statuses_cleanup_cron.hasChanged()) ||
						(form.statuses_cleanup_remote_older_than.valid && form.statuses_cleanup_remote_older_than.hasChanged())
					)
				} />
		</form>
	);
}
