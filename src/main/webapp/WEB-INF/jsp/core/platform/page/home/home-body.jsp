<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
	<div class="rx-body ">
		<div class="rx-header">
			<div class="rx-logo">
				<div class="rx-logo-img">
					<img src="${ctx }/static/core/platform/page/home/image/original-logo.png" />
				</div><h1 class="rx-logo-title">${title }</h1>
			</div>
			<div class="rx-user">
				<div class="rx-user-btnbar">
					<a class="rx-btn-logout" href="${ctx }/resoftCtrl/loginOut" title="退出登录"></a>
					<a class="rx-btn-set" href="#profile" title="个人设置"></a>
				</div>
				<div class="rx-user-info">
					<i class="rx-user-logo"></i><span class="rx-user-name" data-user-id="${userId }">${userName }</span>
				</div>
			</div>
		</div>
		<div class="rx-main">
			<div class="rx-sidebar ">
	            <ul id="rx-menu" class="rx-menu">
	            </ul>
			</div>
			<div class="rx-tabs">
				<div id="rx-tabs-nav" class="rx-tabs-nav"></div>
				<div id="rx-tabs-content" class="rx-tabs-content"></div>
				<div class="rx-footer">${copyright }	</div>
			</div>
		</div>
    </div>
