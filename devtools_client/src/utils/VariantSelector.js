import { Dropdown, Form } from 'semantic-ui-react'
import React from 'react'

export const VariantSelector = ({ value, onChange }) => {
    const variantOptions = ['js', 'ts'].map((name) => {
        return {
            key: name,
            value: name,
            text: name,
        }
    })

    return (
        <Form.Field>
            <label>Variant</label>
            <Dropdown
                compact
                selection
                options={variantOptions}
                value={value}
                onChange={(e, { value }) => onChange(value)}
            />
        </Form.Field>
    )
}
