/* eslint-disable react/jsx-handler-names */
import {Card, Stack, Text} from '@sanity/ui'
import React from 'react'
import {UploaderResolver} from '../../../studio/uploads/types'
import {Item, List} from '../common/list'
import {ArrayOfObjectsInputProps, ObjectItem, ObjectItemProps, UploadEvent} from '../../../types'
import {DefaultArrayInputFunctions} from '../common/ArrayFunctions'
import {withFocusRing} from '../../../components/withFocusRing'
import {ArrayOfObjectsItem} from '../../../members'
import {uploadTarget} from './uploadTarget/uploadTarget'
import {createProtoArrayValue} from './createProtoArrayValue'
import {ItemError} from './item/ItemError'
import {GridItem} from './GridItem'

const UploadTarget = uploadTarget(withFocusRing(Card))

export interface ArrayInputProps<Item extends ObjectItem> extends ArrayOfObjectsInputProps<Item> {
  resolveUploader: UploaderResolver
  onUpload: (event: UploadEvent) => void
}

export function ArrayOfObjectsGridInput<Item extends ObjectItem>(props: ArrayInputProps<Item>) {
  const {
    schemaType,
    onChange,
    value = [],
    readOnly,
    members,
    elementProps,
    resolveUploader,
    onInsert,
    onItemMove,
    onUpload,
    renderPreview,
    renderField,
    renderInput,
  } = props

  const handlePrepend = (item: Item) => {
    onInsert({items: [item], position: 'before', referenceItem: 0})
  }

  const handleAppend = (item: Item) => {
    onInsert({items: [item], position: 'after', referenceItem: -1})
  }

  const sortable = schemaType.options?.sortable !== false

  const renderItem = (itemProps: Omit<ObjectItemProps, 'renderDefault'>) => {
    // todo: consider using a different item component for references
    return (
      <GridItem
        {...itemProps}
        sortable={sortable}
        insertableTypes={schemaType.of}
        preview={renderPreview({
          schemaType: itemProps.schemaType,
          value: itemProps.value,
          layout: 'media',
        })}
      />
    )
  }

  return (
    <Stack space={3}>
      <UploadTarget
        types={schemaType.of}
        resolveUploader={resolveUploader}
        onUpload={onUpload}
        {...elementProps}
        tabIndex={0}
      >
        <Stack data-ui="ArrayInput__content" space={3}>
          {members?.length === 0 && (
            <Card padding={3} border style={{borderStyle: 'dashed'}} radius={2}>
              <Text align="center" muted size={1}>
                {schemaType.placeholder || <>No items</>}
              </Text>
            </Card>
          )}
          {members?.length > 0 && (
            <Card border radius={1}>
              <List
                axis="xy"
                lockAxis="xy"
                columns={[2, 3, 4]}
                gap={3}
                padding={1}
                margin={1}
                onItemMove={onItemMove}
                sortable={sortable}
              >
                {members.map((member, index) => (
                  <Item key={member.key} sortable={sortable} index={index}>
                    {member.kind === 'item' && (
                      <ArrayOfObjectsItem
                        member={member}
                        renderItem={renderItem}
                        renderField={renderField}
                        renderInput={renderInput}
                        renderPreview={renderPreview}
                      />
                    )}
                    {member.kind === 'error' && <ItemError sortable={sortable} member={member} />}
                  </Item>
                ))}
              </List>
            </Card>
          )}
        </Stack>
      </UploadTarget>

      <DefaultArrayInputFunctions
        type={schemaType}
        value={value}
        readOnly={readOnly}
        onAppendItem={handleAppend}
        onPrependItem={handlePrepend}
        onCreateValue={createProtoArrayValue}
        onChange={onChange}
      />
    </Stack>
  )
}