import http from '../common/axios.js'
import { Message } from 'element-ui' 
const check_demo = () => {
	Message({
	  message: "演示", 
	  duration: 5 * 1000
	})
  }


// 获取所有的 sortable
// 获取页面列表
const getSortableAll = () => {
		var CDb='get_data'
		let url = 'get?CDb='+CDb;
	// let url = '/get_data';
	return http.get(url).then(res => {
		return res;
	})
} 
 
// 设置页面信息
const setPageInfo = (data) => {
	//check_demo()
	//alert(1)
	data.CDb = "get_data"
	console.log(data,9999885)
	let url = 'update';
	return http.post(url, data).then(res => {
		return res;
	})
}

// 获取页面主题
const getPageTheme = () => {
	var CDb='get_theme'
	let url = 'get?CDb='+CDb;
	// let url = '/get_theme';
	return http.get(url).then(res => {
		return res;
	})
}

// 设置页面主题
const setPageTheme = (color) => {
	//check_demo()
	var data = {}
	data.color = color
	data.CDb = "get_theme"
	let url = 'update';
	return http.post(url, data).then(res => {
		return res;
	})
}

// 获取移动端运行环境
const getRunPath = () => {
	//check_demo()
}

// 添加新页面
const addPage = (data) => {
	//let url='/zt/add_sor'
	data.CDb='get_data'
	let url = 'add';
	return http.post(url, data).then(res => {
		return res;
	})
}

// 删除页面
const deletePage = (data) => {
	//let url = '/zt/del_sor';
	data.CDb="get_data"
	let url = 'remove';
	// return http.del(url, {'id': id}).then(res => {
	// 	return res;
	// })
	return http.post(url,data).then(res => {
		return res;
	})
}


export default {
	getSortableAll,
	setPageInfo,
	getPageTheme,
	setPageTheme,
	getRunPath,
	addPage,
	deletePage,
}