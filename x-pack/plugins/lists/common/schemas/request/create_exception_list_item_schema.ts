/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/* eslint-disable @typescript-eslint/camelcase */

import * as t from 'io-ts';

import {
  ItemId,
  Tags,
  _Tags,
  _tags,
  comment,
  description,
  exceptionListItemType,
  list_id,
  meta,
  name,
  tags,
} from '../common/schemas';
import { Identity, RequiredKeepUndefined } from '../../types';
import { DefaultEntryArray, DefaultUuid } from '../types';
import { EntriesArray } from '../types/entries';

export const createExceptionListItemSchema = t.intersection([
  t.exact(
    t.type({
      description,
      list_id,
      name,
      type: exceptionListItemType,
    })
  ),
  t.exact(
    t.partial({
      _tags, // defaults to empty array if not set during decode
      comment, // defaults to empty array if not set during decode
      entries: DefaultEntryArray, // defaults to empty array if not set during decode
      item_id: DefaultUuid, // defaults to GUID (uuid v4) if not set during decode
      meta, // defaults to undefined if not set during decode
      tags, // defaults to empty array if not set during decode
    })
  ),
]);

export type CreateExceptionListItemSchemaPartial = Identity<
  t.TypeOf<typeof createExceptionListItemSchema>
>;
export type CreateExceptionListItemSchema = RequiredKeepUndefined<
  t.TypeOf<typeof createExceptionListItemSchema>
>;

// This type is used after a decode since the arrays turn into defaults of empty arrays
// and if a item_id is not specified it turns into a default GUID
export type CreateExceptionListItemSchemaDecoded = Identity<
  Omit<CreateExceptionListItemSchema, '_tags' | 'tags' | 'item_id' | 'entries'> & {
    _tags: _Tags;
    tags: Tags;
    item_id: ItemId;
    entries: EntriesArray;
  }
>;