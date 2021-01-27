<template>
	<div id="index" @mousedown="showStMask" @mouseup="hideStMask">
		<!-- 顶部功能栏 -->
		<top-function :page_list="page_list" :page_list_index="page_list_index" @changePage="changePage" @save="save"
		 @setPage="setPage" @updatePageTheme="updatePageTheme" @updatePage="updatePage"></top-function>
		<!-- 主体区 -->
		<div class="main">
			<!-- 组件栏 -->
			<left-tool :page_type="page_type"></left-tool>
			<div class="phone">
				<!-- 页面列表 -->
				<!-- <page-list :page_list="page_list" :page_list_index="page_list_index" @changePage="changePage"></page-list> -->
				<!-- 模拟手机 -->
				<div class="iframe_param">
					<iframe v-if="show_iframe" name="iframe_name" ref="iframe" class="iframe" :src="iframe_url" frameborder="0"></iframe>
					<div class="st-mask" v-show="isStMask">
						<sortable v-model="sortable_arr" :options="sortable_options" class="sortable" @add="sortableEnd"></sortable>
					</div>
					<!-- 鼠标点击的箭头 -->
					<div class="left-arrow" v-if="scroll_y>0" :style="{'top':(scroll_y-10)+'px'}">
						<div class="left-arrow-ico" @click="up_top()">
							<img class="img-icon" src="@/assets/icom-img/top.png" alt="">
						</div>
						<div class="left-arrow-ico" @click="up_down()">
							<img class="img-icon" src="@/assets/icom-img/donw.png" alt="">
						</div>
						<div class="left-arrow-ico" @click="deleteComp()">
							<img class="img-icon" src="@/assets/icom-img/delete.png" alt="">
						</div>
					</div>
				</div>
				<!-- 中间右侧操作栏 -->
				<phone-right-menu @refreshPhone="refreshPhone" @deleteComp="deleteComp" @backData="backData" @advance="advance"></phone-right-menu>
			</div>
			<!-- 菜单栏 -->
			<right-menu :chang="rightFresh" :init_attr="init_attr" :is_set_page="is_set_page" :page_type="page_type" :page_item="page_list[page_list_index]"
			 @save="save" @setPageSuccess="setPageSuccess"></right-menu>
		</div>


		<!-- 提示弹框 -->
		<el-dialog title="提示" :visible.sync="dialogVisible" width="30%" style="width: 100%;">
			<span>检测到您改变了页面布局，是否保存？</span>
			<span slot="footer" class="dialog-footer">
				<el-button @click="dialogVisibleConfirm(0)">取 消</el-button>
				<el-button type="primary" @click="dialogVisibleConfirm(1)">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>
<script>
	import sortableModel from '../../api/sortable.js'
	import CompList from '../../common/st-data.js'
	import LeftTool from '@/components/LeftTool.vue'
	import RightMenu from '@/components/RightMenu.vue'
	import PhoneRightMenu from '@/components/PhoneRightMenu.vue'
	import TopFunction from '@/components/TopFunction.vue'

	export default {
		data() {
			return {
				drawer: false,
				length: 1,
				sortable_arr: [],
				show_iframe: true,
				iframe_url: '',
				isStMask: false,
				sortable_options: {
					group: {
						name: 'sort',
						pull: true,
					},
					sort: false,
					animation: 200,
				},
				// 控制菜单栏刷新
				rightFresh: true,
				// 页面列表
				page_list: [],
				// 控制当前显示的页面列表中的样式
				page_list_index: 0,
				// 标识iframe当前页面是否改变
				is_page_change: false,
				dialogVisible: false,
				// iframe要跳转下一个页面路径
				next_page_path: '',
				// iframe要跳转下一个页面在页面列表的坐标
				next_page_index: -1,
				// iframe要跳转下一个页面的id
				next_page_id: -1,
				// 初始化 右侧 组件属性设置对象
				init_attr: false,
				// 标识鼠标点击的元素距离顶部的高度
				scroll_y: 0,
				// 当前页面的页面类型
				page_type: '',
				// iframe要跳转下一个页面的页面类型
				next_page_type: '',
				// 是否是页面设置
				is_set_page: false,
			}
		},
		components: {
			LeftTool,
			RightMenu,
			PhoneRightMenu,
			TopFunction,
		},
		mounted() {
			window.addEventListener('message', this.acceptMessage, false);
			this.getPageList();
		},
		methods: {
			get_img(e) {
				this.drawer = false
				for (let k in e) {
					const v = e[k]
					this.img_list.push(v)
					this.addform.img_id = v.id
				}
				this.length = 6 - this.img_list.length
				// console.log('get_img_end:', e, this.img_list)
				// console.log(this.addform)
			},
			// 获取页面列表
			getPageList() {
				const _this = this;
				sortableModel.getSortableAll().then(res => {
					console.log(res)
					// _this.changePage(0, res[0].path);
					// _this.page_type = res[0].type;
					// _this.page_list = res;
					_this.changePage(0, res.data[0].path);
					_this.page_type = res.data[0].type;
					_this.page_list = res.data;
				})
			},
			// 保存布局
			save(flag) {
				// flag: 0 保存布局 1 设置属性数据
				// this.$refs.iframe.contentWindow.save();
				// window.frames['iframe_name'].save();
				// console.log(this.$refs.iframe)
				let dat = {};
				if (flag == 1) {
					dat = JSON.parse(localStorage.getItem('attr_obj'));
					this.$refs.iframe.contentWindow.postMessage({
						method: 'update',
						data: dat,
					}, '*');
				} else {
					this.$refs.iframe.contentWindow.postMessage({
						method: 'layoutSave',
					}, '*');
				}
			},
			// 监听 iframe 中方法
			acceptMessage(event) {
				let dat = event.data;
				switch (dat.method) {
					case 'saveSuccess':
						this.saveSuccess();
						break;
					case 'saveFail':
						this.saveFail();
						break;
					case 'deleteSuccess':
						this.deleteSuccess();
						break;
					case 'deleteFail':
						this.deleteFail();
						break;
					case 'pageLayoutChange':
						this.pageLayoutChange(dat.data);
						break;
					case 'activeGetUnique':
						this.activeGetUnique(dat.data);
						break;
					case 'getScrollY':
						this.getScrollY(dat.data);
						break;
				}
			},
			// 保存成功回调
			saveSuccess() {
				const _this = this;
				// console.log('is_page_change', this.is_page_change, this.page_list[this.page_list_index])
				if (this.is_page_change) {
					this.is_page_change = false;
					if (this.next_page_index != -1) {
						this.page_list_index = this.next_page_index;
						setTimeout(() => {
							_this.changePage(_this.next_page_index || _this.page_list_index, _this.next_page_path || _this.page_list[_this
								.page_list_index].path, _this.next_page_type || _this.page_type, _this.next_page_id || _this.page_list[
								_this.page_list_index].id);
						}, 100)
					}

				}
				this.$notify({
					title: '保存成功',
					type: 'success',
				})
				this.refreshPhone();
				this.hideLeftArrow();
			},
			// 保存失败回调
			saveFail() {
				console.log('保存失败')
				this.refreshPhone();
				this.$notify({
					title: '保存失败',
					type: 'error',
				})
				this.hideLeftArrow();
			},
			// 删除组件成功回调
			deleteSuccess() {
				// this.refreshPhone();
				this.$notify({
					title: '删除成功',
					type: 'success',
				})
				this.hideLeftArrow();
			},
			// 删除组件失败回调
			deleteFail() {
				// this.refreshPhone();
				this.$notify({
					title: '删除失败',
					type: 'error',
				})
				this.hideLeftArrow();
			},
			// 监听 iframe 页面布局改变
			pageLayoutChange(data) {
				// console.log('布局改变: ', data)
				this.is_page_change = data.flag;
				// this.hideLeftArrow();
			},
			// 刷新页面
			refreshPhone() {
				console.log('重新加载页面')
				const _this = this;
				_this.show_iframe = false;
				_this.initRightAttr();
				setTimeout(() => {
					_this.show_iframe = true;
					// 保证 iframe 先渲染完成
					setTimeout(() => {
						// 每次刷新页面都要传 id，否则请求不到数据
						_this.sendID(_this.page_list[_this.page_list_index].id);
					}, 500)
				}, 10)
				this.hideLeftArrow();
			},
			// 显示遮罩
			showStMask() {
				this.isStMask = true;
			},
			// 隐藏遮罩
			hideStMask() {
				this.isStMask = false;
			},
			// 监听组件被拉入 iframe 中
			sortableEnd(evt) {
				let data_sorts = evt.clone.dataset.sorts;
				let attr_obj = {};
				// let attr_obj = JSON.parse(localStorage.getItem('attr_obj'));
				for (let k in CompList) {
					if (CompList[k].sorts == data_sorts) {
						attr_obj = CompList[k];
						break;
					}
				}
				// 让组件移动到 iframe 上之后隐藏
				evt.item.style.display = 'none';
				// 让组件移动到 iframe 上之后隐藏 end
				this.isStMask = false;
				// this.rightFresh = !this.rightFresh;
				this.is_page_change = true;
				this.$refs.iframe.contentWindow.postMessage({
					method: 'add-st',
					data: {
						attr_obj,
					}
				}, '*');
				this.hideLeftArrow();
			},
			// 切换页面
			changePage(index, url, type) {
				// console.log('url', url)
				if (this.is_page_change) {
					this.dialogVisible = true;
					this.next_page_index = index;
					this.next_page_path = url;
					this.next_page_type = type;
					return;
				}
				this.initRightAttr();
				this.page_list_index = index;
				this.iframe_url = url;
				this.next_page_index = -1;
				this.next_page_path = '';
				this.hideLeftArrow();
				this.page_type = type;
				this.is_set_page = false;
			},
			// 弹框确定取消按钮
			dialogVisibleConfirm(flag) {
				// flag: 1 保存布局 0 不保存
				this.dialogVisible = false;
				if (flag == 1) {
					this.save(0);
				} else {
					this.is_page_change = false;
					this.changePage(this.next_page_index, this.next_page_path, this.next_page_type, this.next_page_id);
				}
			},
			// 鼠标点击 iframe 中组件获取该组件的 unique
			activeGetUnique(data) {
				// console.log('fu:', data);
				let item = data.item;
				localStorage.setItem('attr_obj', JSON.stringify(item));
				this.rightFresh = !this.rightFresh;
				this.is_set_page = false;
				// console.log(item);
			},
			// 通过 unique 删除 iframe 组件
			deleteComp() {
				this.initRightAttr();
				this.$refs.iframe.contentWindow.postMessage({
					method: 'deleteCompUnique'
				}, '*');
				this.hideLeftArrow();
			},
			up_down(){
				this.$refs.iframe.contentWindow.postMessage({
					method: 'up_downCompUnique'
				}, '*');
			},
			up_top(){
				this.$refs.iframe.contentWindow.postMessage({
					method: 'up_topCompUnique'
				}, '*');
			},
			// 初始化右侧属性设置框
			initRightAttr() {
				this.init_attr = !this.init_attr;
			},
			// 接收鼠标点击的位置
			getScrollY(data) {
				this.scroll_y = data.scroll_y + 30;
			},
			// 隐藏指向鼠标点击的向左箭头
			hideLeftArrow() {
				this.scroll_y = 0;
			},
			// 返回上一步
			backData() {
				// console.log('back data')
				this.$refs.iframe.contentWindow.postMessage({
					method: 'backData'
				}, '*');
				this.hideLeftArrow();
			},
			// 前进
			advance() {
				// console.log('advance')
				this.$refs.iframe.contentWindow.postMessage({
					method: 'advance'
				}, '*');
				this.hideLeftArrow();
			},
			// 页面设置
			setPage() {
				this.is_set_page = true;
				this.hideLeftArrow();
			},
			// 页面信息设置成功
			setPageSuccess() {
				this.$refs.iframe.contentWindow.postMessage({
					method: 'setPageSuccess'
				}, '*');
			},
			// 更新页面主题
			updatePageTheme() {
				this.$refs.iframe.contentWindow.postMessage({
					method: 'updatePageTheme'
				}, '*');
			},
			// 更新页面列表
			updatePage() {
				const _this = this;
				sortableModel.getSortableAll().then(res => {
					_this.page_list = res.data;
				})
			},
			// 将 id 传到子窗口去
			sendID(id) {
				const _this = this;
				let loading = this.$loading({
					lock: true,
					text: '正在等待移动端加载完成 ...',
					spinner: 'el-icon-loading',
					background: 'rgba(255, 255, 255, 0.1)'
				})
				setTimeout(() => {
					_this.$refs.iframe.contentWindow.postMessage({
						method: 'sendID',
						data: {
							id
						}
					}, '*');
					loading.close();
				}, 1000)
			},

		}
	}
</script>



<style lang="scss">
	#index {
		height: 100%;
		width: 100%;

		>div {
			&:nth-child(1) {
				height: 60px;
			}
		}

		.main {
			display: flex;
			height: calc(100vh - 60px);
			overflow: hidden;

			>div {
				padding: 20px;

				&:nth-child(3) {
					width: 50%;
				}
			}

			.phone {
				position: relative;
				width: 100%;
				height: 100%;
				overflow: hidden;
				background-color: #ddd;
				box-shadow: 0 0 10px #999 inset;
				display: flex;
				justify-content: center;

				>div {
					box-shadow: 0 0 10px #999;
				}

				.iframe_param {
					position: relative;
					width: 416px;
					height: 738px;

					.iframe {
						width: 100%;
						height: 100%;
					}

					.st-mask {
						position: absolute;
						left: 0;
						top: 0;
						width: 100%;
						height: 100%;

						.sortable {
							width: 100%;
							height: 100%;

							>* {
								display: none;
							}
						}
					}
				}
			
				.left-arrow {
					position: absolute;
					top: 0;
					right: 0px;
					width: 30px;
					height: 30px;
					animation: ant 1.5s linear infinite;
					.left-arrow-ico{
						width: 100%;
						height: 100%;
						margin-top: 20px;
						img{
							width: 100%;
							height: 100%;
						}
					}
				}

				@keyframes ant {
					0% {
						right: -30px;
					}

					25% {
						right: -33px;
					}

					50% {
						right: -35px;
					}

					75% {
						right: -33px;
					}

					100% {
						right: -30px;
					}
				}
			}
		}
	}
</style>
