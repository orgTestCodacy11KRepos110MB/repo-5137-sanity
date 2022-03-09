// @todo: remove the following line when part imports has been removed from this file
///<reference types="@sanity/types/parts" />

import React from 'react'
import {uniqueId} from 'lodash'
import {Box, Grid, Button, Dialog} from '@sanity/ui'
import {TrashIcon, EditIcon} from '@sanity/icons'
import config from 'config:@sanity/google-maps-input'
import {
  FormFieldSet,
  ChangeIndicatorCompareValueProvider,
  ChangeIndicator,
} from '@sanity/base/components'
import {FormInputProps, PatchEvent, set, setIfMissing, unset} from '@sanity/form-builder'
import {GoogleMapsLoadProxy} from '../loader/GoogleMapsLoadProxy'
import {Geopoint, GeopointSchemaType} from '../types'
import {GeopointSelect} from './GeopointSelect'
import {PreviewImage, DialogInnerContainer} from './GeopointInput.styles'

const getStaticImageUrl = (value) => {
  const loc = `${value.lat},${value.lng}`
  const params = {
    key: config.apiKey,
    center: loc,
    markers: loc,
    zoom: 13,
    scale: 2,
    size: '640x300',
  }

  const qs = Object.keys(params).reduce((res, param) => {
    return res.concat(`${param}=${encodeURIComponent(params[param])}`)
  }, [] as string[])

  return `https://maps.googleapis.com/maps/api/staticmap?${qs.join('&')}`
}

type GeopointInputProps = FormInputProps<Geopoint, GeopointSchemaType>

// @todo
// interface Focusable {
//   focus: () => void
// }
type Focusable = any

interface InputState {
  modalOpen: boolean
}

class GeopointInput extends React.PureComponent<GeopointInputProps, InputState> {
  _geopointInputId = uniqueId('GeopointInput')

  static defaultProps = {
    validation: [],
  }

  editButton: Focusable | undefined

  constructor(props) {
    super(props)

    this.state = {
      modalOpen: false,
    }
  }

  setEditButton = (el: Focusable) => {
    this.editButton = el
  }

  focus() {
    if (this.editButton) {
      this.editButton.focus()
    }
  }

  handleFocus = (event) => {
    this.props.onFocus(event)
  }

  handleBlur = () => {
    this.props.onBlur?.()
  }

  handleToggleModal = () => {
    const {onFocus, onBlur} = this.props
    this.setState(
      (prevState) => ({modalOpen: !prevState.modalOpen}),
      () => {
        if (this.state.modalOpen) {
          onFocus(['$'])
        } else {
          onBlur?.()
        }
      }
    )
  }

  handleCloseModal = () => {
    this.setState({modalOpen: false})
  }

  handleChange = (latLng: google.maps.LatLng) => {
    const {type, onChange} = this.props
    onChange(
      PatchEvent.from([
        setIfMissing({
          _type: type.name,
        }),
        set(latLng.lat(), ['lat']),
        set(latLng.lng(), ['lng']),
      ])
    )
  }

  handleClear = () => {
    const {onChange} = this.props
    onChange(PatchEvent.from(unset()))
  }

  render() {
    const {value, compareValue, readOnly, type, validation, level, presence} = this.props
    const {modalOpen} = this.state

    if (!config || !config.apiKey) {
      return (
        <div>
          <p>
            The <a href="https://sanity.io/docs/schema-types/geopoint-type">Geopoint type</a> needs
            a Google Maps API key with access to:
          </p>
          <ul>
            <li>Google Maps JavaScript API</li>
            <li>Google Places API Web Service</li>
            <li>Google Static Maps API</li>
          </ul>
          <p>
            Please enter the API key with access to these services in
            <code style={{whiteSpace: 'nowrap'}}>
              `&lt;project-root&gt;/config/@sanity/google-maps-input.json`
            </code>
          </p>
        </div>
      )
    }

    return (
      <FormFieldSet
        level={level}
        title={type.title}
        description={type.description}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        __unstable_presence={presence}
        __unstable_changeIndicator={false}
        validation={validation}
      >
        <div>
          {value && (
            <ChangeIndicatorCompareValueProvider value={value} compareValue={compareValue}>
              <ChangeIndicator compareDeep>
                <PreviewImage src={getStaticImageUrl(value)} alt="Map location" />
              </ChangeIndicator>
            </ChangeIndicatorCompareValueProvider>
          )}

          {!readOnly && (
            <Box marginTop={4}>
              <Grid columns={2} gap={2}>
                <Button
                  mode="ghost"
                  icon={value && EditIcon}
                  padding={3}
                  ref={this.setEditButton}
                  text={value ? 'Edit' : 'Set location'}
                  onClick={this.handleToggleModal}
                />

                {value && (
                  <Button
                    tone="critical"
                    icon={TrashIcon}
                    padding={3}
                    mode="ghost"
                    text={'Remove'}
                    onClick={this.handleClear}
                  />
                )}
              </Grid>
            </Box>
          )}

          {modalOpen && (
            <Dialog
              id={`${this._geopointInputId}_dialog`}
              onClose={this.handleCloseModal}
              header="Place the marker on the map"
              width={1}
            >
              <DialogInnerContainer>
                <GoogleMapsLoadProxy>
                  {(api) => (
                    <GeopointSelect
                      api={api}
                      value={value || undefined}
                      onChange={readOnly ? undefined : this.handleChange}
                      defaultLocation={config.defaultLocation}
                      defaultZoom={config.defaultZoom}
                    />
                  )}
                </GoogleMapsLoadProxy>
              </DialogInnerContainer>
            </Dialog>
          )}
        </div>
      </FormFieldSet>
    )
  }
}

export default GeopointInput
