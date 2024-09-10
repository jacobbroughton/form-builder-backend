export type InputTypeType = {
  id: number,
  name: string,
  description: string
}

export type InputTypePropertyType = {
  id: number,
  input_type_id: number,
	property_name: string,
	property_description: string,
  property_type: string,
  value: string
}

export type InputTypePropertyOptionType = {
  id: number,
  property_id: number,
  option_name: number,
  option_value: string,
  checked: boolean
}

export type HashmapType = {
  [key: string]: object[]
}