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
import _ from 'lodash';
import {
  OpenSearchResponse,
  SavedObject,
  SavedObjectConfig,
  SavedObjectOpenSearchDashboardsServices,
} from '../../types';
import { SavedObjectNotFound } from '../../../../opensearch_dashboards_utils/public';
import {
  IndexPattern,
  injectSearchSourceReferences,
  parseSearchSourceJSON,
  expandShorthand,
} from '../../../../data/public';

/**
 * A given response of and OpenSearch containing a plain saved object is applied to the given
 * savedObject
 */
export async function applyOpenSearchResp(
  resp: OpenSearchResponse,
  savedObject: SavedObject,
  config: SavedObjectConfig,
  dependencies: SavedObjectOpenSearchDashboardsServices
) {
  const mapping = expandShorthand(config.mapping);
  const opensearchType = config.type || '';
  savedObject._source = _.cloneDeep(resp._source);
  const injectReferences = config.injectReferences;
  if (typeof resp.found === 'boolean' && !resp.found) {
    throw new SavedObjectNotFound(opensearchType, savedObject.id || '');
  }

  const meta = resp._source.opensearchDashboardsSavedObjectMeta || {};
  delete resp._source.opensearchDashboardsSavedObjectMeta;

  if (!config.indexPattern && savedObject._source.indexPattern) {
    config.indexPattern = savedObject._source.indexPattern as IndexPattern;
    delete savedObject._source.indexPattern;
  }

  // assign the defaults to the response
  _.defaults(savedObject._source, savedObject.defaults);

  // transform the source using _deserializers
  _.forOwn(mapping, (fieldMapping, fieldName) => {
    if (fieldMapping._deserialize && typeof fieldName === 'string') {
      savedObject._source[fieldName] = fieldMapping._deserialize(
        savedObject._source[fieldName] as string
      );
    }
  });

  // Give obj all of the values in _source.fields
  _.assign(savedObject, savedObject._source);
  savedObject.lastSavedTitle = savedObject.title;

  if (meta.searchSourceJSON) {
    try {
      let searchSourceValues = parseSearchSourceJSON(meta.searchSourceJSON);

      if (config.searchSource) {
        searchSourceValues = injectSearchSourceReferences(
          searchSourceValues as any,
          resp.references
        );
        savedObject.searchSource = await dependencies.search.searchSource.create(
          searchSourceValues
        );
      } else {
        savedObject.searchSourceFields = searchSourceValues;
      }
    } catch (error) {
      if (
        error.constructor.name === 'SavedObjectNotFound' &&
        error.savedObjectType === 'index-pattern'
      ) {
        // if parsing the search source fails because the index pattern wasn't found,
        // remember the reference - this is required for error handling on legacy imports
        savedObject.unresolvedIndexPatternReference = {
          name: 'opensearchDashboardsSavedObjectMeta.searchSourceJSON.index',
          id: JSON.parse(meta.searchSourceJSON).index,
          type: 'index-pattern',
        };
      }

      throw error;
    }
  }

  if (injectReferences && resp.references && resp.references.length > 0) {
    injectReferences(savedObject, resp.references);
  }

  if (typeof config.afterOpenSearchResp === 'function') {
    savedObject = await config.afterOpenSearchResp(savedObject);
  }

  return savedObject;
}
