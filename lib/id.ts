import { v4 } from 'uuid'


export const uuid = () => v4()

export const truncate = id => id.replace(/^(\w{7}).*$/, '$1')