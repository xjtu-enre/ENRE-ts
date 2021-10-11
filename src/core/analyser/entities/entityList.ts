import {entityType} from './entities';

// SHOULD ONLY BE INVOKED ONCE
const createEntityList = () => {
	let eList: Array<entityType> = [];

	return {
		add: (entity: entityType) => {
			eList.push(entity)
		},

		get all() {
			return eList
		},

		getById: (id: number) => {
			return eList.find(e => e.id === id)
		}
	}
}

export default createEntityList()
