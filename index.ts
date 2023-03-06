interface Employee {
	id: number;
	name: string;
	salary: number;
}

const obj: Employee = {
	id: 1,
	name: 'Bobby Hadz',
	salary: 100,
};

// 👇️ remove `name` property
const { name: _, ...newObj } = obj;

console.log(newObj); // { id: 1, salary: 100 }

console.log(newObj.id); // 1
console.log(newObj.salary); // 100
