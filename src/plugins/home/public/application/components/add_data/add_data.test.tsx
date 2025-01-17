/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/*
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import React from 'react';
import { AddData } from './add_data';
import { shallowWithIntl } from 'test_utils/enzyme_helpers';

jest.mock('../app_navigation_handler', () => {
  return {
    createAppNavigationHandler: jest.fn(() => () => {}),
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});

const addBasePathMock = jest.fn((path: string) => (path ? path : 'path'));

const mockFeatures = [
  {
    category: 'data',
    description: 'Ingest data from popular apps and services.',
    showOnHomePage: true,
    icon: 'indexOpen',
    id: 'home_tutorial_directory',
    order: 500,
    path: '/app/home#/tutorial_directory',
    title: 'Ingest data',
  },
  {
    category: 'admin',
    description: 'Add and manage your fleet of OpenSearch Agents and integrations.',
    showOnHomePage: true,
    icon: 'indexManagementApp',
    id: 'ingestManager',
    order: 510,
    path: '/app/ingestManager',
    title: 'Add OpenSearch Agent',
  },
  {
    category: 'data',
    description: 'Import your own CSV, NDJSON, or log file',
    showOnHomePage: true,
    icon: 'document',
    id: 'ml_file_data_visualizer',
    order: 520,
    path: '/app/ml#/filedatavisualizer',
    title: 'Upload a file',
  },
];

describe('AddData', () => {
  test('render', () => {
    const component = shallowWithIntl(
      <AddData addBasePath={addBasePathMock} features={mockFeatures} />
    );
    expect(component).toMatchSnapshot();
  });
});
