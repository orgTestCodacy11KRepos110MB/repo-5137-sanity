import {Schema, ObjectSchemaType} from '@sanity/types'
import React from 'react'
import {FieldMember, ObjectFormNode, ObjectInputProps} from '../../src/form'
import {
  defaultRenderField,
  defaultRenderInput,
  defaultRenderItem,
  defaultRenderPreview,
} from '../../src/form/studio/defaults'
import {renderInput, TestRenderInputContext, TestRenderInputProps} from './renderInput'
import {TestRenderProps} from './types'

export type TestRenderObjectInputCallback = (
  inputProps: ObjectInputProps,
  context: TestRenderInputContext
) => React.ReactElement

export async function renderObjectInput(options: {
  fieldDefinition: Schema.TypeDefinition<'object'>
  props?: TestRenderProps
  render: TestRenderObjectInputCallback
}) {
  const {fieldDefinition, props, render: initialRender} = options

  const onCloseField = jest.fn()
  const onCollapse = jest.fn()
  const onCollapseField = jest.fn()
  const onCollapseFieldSet = jest.fn()
  const onExpand = jest.fn()
  const onExpandField = jest.fn()
  const onExpandFieldSet = jest.fn()
  const onOpenField = jest.fn()
  const onFieldGroupSelect = jest.fn()

  function transformProps(
    inputProps: TestRenderInputProps,
    context: TestRenderInputContext
  ): ObjectInputProps {
    const {formState} = context
    const {onPathFocus, path, schemaType, value, ...restProps} = inputProps
    const fieldMember = formState.members?.find(
      (member) => member.kind === 'field' && member.name === fieldDefinition.name
    ) as FieldMember<ObjectFormNode> | undefined
    const field = fieldMember?.field

    return {
      ...restProps,
      collapsed: false,
      changed: false,
      groups: field?.groups || [],
      members: field?.members || [],
      onCloseField,
      onCollapse,
      onCollapseField,
      onCollapseFieldSet,
      onExpand,
      onExpandField,
      onExpandFieldSet,
      onFieldGroupSelect,
      onFocusPath: onPathFocus,
      onOpenField,
      path,
      renderField: defaultRenderField,
      renderInput: defaultRenderInput,
      renderItem: defaultRenderItem,
      renderPreview: defaultRenderPreview,
      schemaType: schemaType as ObjectSchemaType,
      value: value as Record<string, any>,
    }
  }

  const result = await renderInput({
    fieldDefinition,
    props,
    render: (inputProps, context) => initialRender(transformProps(inputProps, context), context),
  })

  function rerender(subsequentRender: TestRenderObjectInputCallback) {
    result.rerender((inputProps, context) =>
      subsequentRender(transformProps(inputProps, context), context)
    )
  }

  return {...result, rerender}
}
