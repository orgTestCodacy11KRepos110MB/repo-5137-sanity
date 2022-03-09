import React, {useMemo} from 'react'
import {isValidationErrorMarker, StringSchemaType} from '@sanity/types'
import {TextInput} from '@sanity/ui'
import {useId} from '@reach/auto-id'
import {FormField} from '@sanity/base/components'
import PatchEvent, {set, unset} from '../PatchEvent'
import {getValidationRule} from '../utils/getValidationRule'
import {FormInputProps} from '../types'

export type UrlInputProps = FormInputProps<string, StringSchemaType>

// @todo Rename to `URLInput`?
const UrlInput = React.forwardRef(function UrlInput(
  props: UrlInputProps,
  forwardedRef: React.ForwardedRef<HTMLInputElement>
) {
  const {value, readOnly, type, validation, level, onFocus, onBlur, onChange, presence} = props
  const inputId = useId()
  const errors = useMemo(() => validation.filter(isValidationErrorMarker), [validation])

  const handleChange = React.useCallback(
    (event) => {
      const inputValue = event.currentTarget.value
      onChange(PatchEvent.from(inputValue ? set(inputValue) : unset()))
    },
    [onChange]
  )
  const uriRule = getValidationRule(type, 'uri')
  const inputType = uriRule?.constraint?.options?.allowRelative ? 'text' : 'url'
  return (
    <FormField
      level={level}
      validation={validation}
      title={type.title}
      description={type.description}
      __unstable_presence={presence}
      inputId={inputId}
    >
      <TextInput
        type={inputType}
        inputMode="url"
        id={inputId}
        customValidity={errors.length > 0 ? errors[0].item.message : ''}
        value={value || ''}
        readOnly={Boolean(readOnly)}
        placeholder={type.placeholder}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
        ref={forwardedRef}
      />
    </FormField>
  )
})

export default UrlInput
