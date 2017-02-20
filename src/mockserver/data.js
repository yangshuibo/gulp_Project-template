const Mock = require('mockjs');
const Random = Mock.Random;

module.exports = function() {
	var data = {
		users: [], //users接口
		news: [] //news接口
	}


	//users接口
	for (let i = 1; i <= 10; i++) {
		data.users.push({
			id: i,
			username: Random.cname(),
			age: Random.natural(0, 100),
			gender: Random.natural(0, 1),
			birthday: Random.datetime()
		})
	}


	//news接口
	for (let i = 1; i <= 10; i++) {
		data.news.push({
			id: i, //id
			title: Random.ctitle(15, 25), //title
			images: Random.image('200x100'), //images
			postuser: Random.cname(), //postuser
			postdate: Random.datetime(), //date
			star: Random.natural(0, 100), //star
			comments: Random.natural(0, 100) //comments
		})
	}

	return data;
}
