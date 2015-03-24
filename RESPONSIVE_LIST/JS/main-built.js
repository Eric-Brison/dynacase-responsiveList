define("rsp/models/document",["underscore","backbone"],function(){return Backbone.Model.extend({idAttribute:"initid",defaults:{state:null,viewId:"!defaultConsultation",title:"Chargement...",icon:!1},isNew:function(){return!0},parse:function(e){return e.properties}})}),define("rsp/collections/document",["underscore","rsp/models/document","backbone"],function(e,t){var i=e.template("<%= urlBase %>?slice=<%= slice %>&offset=<%= offset %>&keyword=<%= keyWord %>");return Backbone.Collection.extend({model:t,url:function(){return i(this)},initialize:function(e,t){if(!t.url)throw new Error("the document model needs an url conf");this.urlBase=t.url,this.slice=10,this.offset=0,this.keyWord=""},parse:function(e){return this.nbResult=e.data.resultMax,e.data.documents},reset:function(){return this.nbResult=null,this.slice=10,this.offset=0,Backbone.Collection.prototype.reset.apply(this,arguments)}})}),define("rsp/models/search",["underscore","rsp/collections/document","backbone"],function(e,t){return Backbone.Model.extend({idAttribute:"initid",initialize:function(){this.listenTo(this,"selected",this.prepareDocumentList),this.set("associatedDocumentList",new t([],{url:window.location.pathname+"api/v1/rspl/listDocument/"+this.id})),this.collectionInitialized=!1,this.listenTo(this.get("associatedDocumentList"),"add",this.propagateAdd),this.listenTo(this.get("associatedDocumentList"),"reset",this.propagateReset),this.listenTo(this.get("associatedDocumentList"),"sync",this.propagateSync)},parse:function(e){return e.properties},prepareDocumentList:function(){this.collectionInitialized||this.get("associatedDocumentList").fetch()},propagateAdd:function(e){this.trigger("addDocumentList",this,this.get("associatedDocumentList"),e)},propagateReset:function(){this.trigger("resetDocumentList",this,this.get("associatedDocumentList"))},propagateSync:function(){this.trigger("syncDocumentList",this,this.get("associatedDocumentList"))}})}),define("rsp/collections/search",["underscore","rsp/models/search","backbone"],function(e,t){return Backbone.Collection.extend({url:window.location.pathname+"api/v1/rspl/listDocument/DIR_RESPONSIVE_LIST",model:t,parse:function(e){return e.data.documents}})}),define("rsp/collections/openDocument",["rsp/models/document","backbone"],function(e){return Backbone.Collection.extend({model:e,initialize:function(){this.listenTo(this,"selected",this.propagateSelected),this.listenTo(this,"destroy",this.selectAnotherOne)},propagateSelected:function(e){this.each(function(t){t.set("selected",e.id===t.id)})},selectAnotherOne:function(e,t,i){var n=this.at(i.index)||this.at(i.index-1);e.get("selected")&&n&&n.trigger("selected",n),0===this.length&&(window.document.title="Les documents")}})}),define("rsp/views/search",["underscore","backbone"],function(){return Backbone.View.extend({tagName:"option",render:function(){return this.$el.data("searchId",this.model.id).attr("value",this.model.id).addClass("searchElement").text(this.model.get("title")),this}})}),define("rsp/views/searches",["underscore","rsp/views/search","backbone"],function(e,t){var i=e.template('<select class="form-control documentsList__searchList__select"></select>');return Backbone.View.extend({tagName:"form",events:{change:"displayDocumentList"},initialize:function(e){if(!e.collection)throw new Error("You need to associate the searches view with a collection");this.collection=e.collection,this.listenTo(this.collection,"add",this._addOne),this.listenTo(this.collection,"reset",this.render),this.listenTo(this.collection,"sync",this.displayDocumentList)},render:function(){return this.$el.empty().append(i()),this._addAll(),this},_addAll:function(){this.collection.each(this._addOne)},_addOne:function(e){var i=new t({model:e});this.$el.find(".documentsList__searchList__select").append(i.render().$el)},displayDocumentList:function(){var e=this.$el.find(".documentsList__searchList__select").val(),t=this.collection.get(e);t&&t.trigger("selected",t)}})}),define("rsp/views/documentList",["jquery","underscore","backbone"],function(e,t){var i={global:t.template('<div class="documentsList__documents__list__element <%- id %>">   <div class="bg-info documentsList__documents__list__element__nbResult clearfix">       <span class="documentsList__documents__list__element__nbResult__container"></span>       <button class="btn btn-link pull-right documentsList__documents__list__element__reload"><span class="glyphicon glyphicon-repeat pull-right" aria-hidden="true"></span></button>   </div>   <div class="documentsList__documents__list__elements">       <div class="list-group"></div>       <div class="documentsList__documents__list__elements__loading">Loading...</div>   </div></div>'),document:t.template('<a href="#<%- initid %>" data-id="<%- initid %>" data-title="<%- title %>" class="list-group-item documentElement clearfix">    <img src="<%- icon %>" class="img-circle documentElement__icon" />   <%- title %>   <% if (state) { %>                     <div>                   <span class="label label-default pull-right documentElement__state"                            style="background-color : <%- state.color %>;                           color : #<%- (\'000000\' + ((\'0xffffff\' ^ state.color.replace("#", "0x")).toString(16))).slice(-6) %>;">                           <%- state.displayValue %>                   </span></div>    <% } %></a>')};return Backbone.View.extend({events:{"click .documentsList__documents__list__element__reload":"reloadSelected","submit .documentsList__documents__search__form":"updateKeyword","click .documentElement":"openDocument"},initialize:function(i){var n=this;if(!i.collection)throw new Error("You need to associate the document list view with a collection");this.collection=i.collection,this.openDocuments=i.openDocuments,this.listenTo(this.collection,"selected",this.displaySelected),this.listenTo(this.collection,"addDocumentList",this._addOne),this.listenTo(this.collection,"resetDocumentList",this._addAll),this.listenTo(this.collection,"syncDocumentList",this._updateNumber),this.listenTo(this.collection,"syncDocumentList",this._needToLoadMore),this.listenTo(this,"reloadDocumentList",this.reloadAll),this.listenTo(this,"reloadDocument",this.reloadDocument),this.listenTo(this,"removeDocument",this.removeDocument),this.$el.find(".documentsList__documents__search__form").on("submit",function(e){e.preventDefault(),n.updateKeyWord(e)}),e(window).on("resize",t.debounce(t.bind(this._resize,this),200))},displaySelected:function(e){var t=this.$el.find("."+e.id);this.$el.find(".documentsList__documents__list__element").hide(),0===t.length&&(this._addAll(e,e.get("associatedDocumentList")),t=this.$el.find("."+e.id)),this.currentSelectedModel=e,this.$el.find(".documentsList__documents__search__keyWord").val(this.currentSelectedModel.get("associatedDocumentList").keyWord),t.show()},reloadSelected:function(){this.currentSelectedModel.get("associatedDocumentList").reset(),this.currentSelectedModel.get("associatedDocumentList").fetch()},reloadAll:function(){this.reloadSelected(),this.$el(".documentsList__documents__list__element:hidden").remove()},reloadDocument:function(e){e.state||(e.state=null),t.defaults(e,{initid:"",title:"",state:"",icon:""}),this.$el.find("[href=#"+e.initid+"]").replaceWith(i.document(e))},removeDocument:function(){this.reloadSelected(),this.$el.find("[href=#"+document.initid+"]").remove()},updateKeyWord:function(e){e.preventDefault(),this.currentSelectedModel.get("associatedDocumentList").reset(),this.currentSelectedModel.get("associatedDocumentList").keyWord=this.$el.find(".documentsList__documents__search__keyWord").val(),this.currentSelectedModel.get("associatedDocumentList").fetch()},openDocument:function(t){var i=e(t.currentTarget),n=i.data("id"),o=this.openDocuments.get(n);t.preventDefault(),o?o.trigger("selected",o):this.openDocuments.add({initid:n,title:i.data("title"),icon:i.find(".documentElement__icon").attr("src")})},_getCurrentDiv:function(e){var t=this.$el.find("."+e.id);return 0===t.length?!1:t},_addOne:function(e,t,n){var o=this._getCurrentDiv(e);o&&o.find(".list-group").append(i.document(n.toJSON()))},_addAll:function(e,n){var o=t.bind(this._addOne,this),s=this._getCurrentDiv(e);s&&(s.find(".documentsList__documents__list__elements").off("dl"),s.remove()),this.$el.find(".documentsList__documents__list").append(i.global(e.toJSON())),this._resize(!0),s=this._getCurrentDiv(e),s&&s.find(".documentsList__documents__list__elements").on("scroll.dl",t.debounce(t.bind(function(){this._needToLoadMore(e,n)},this),200)),n.each(function(t){o(e,n,t)})},_updateNumber:function(e,t){var i=this._getCurrentDiv(e),n=" document";i&&(t.nbResult>1&&(n=" documents"),i.find(".documentsList__documents__list__element__nbResult__container").text(t.nbResult+n)),this._resize()},_needToLoadMore:function(e,t){var i,n=this._getCurrentDiv(e);n&&(i=n.find(".documentsList__documents__list__elements__loading"),null!==t.nbResult&&t.offset+t.slice>=t.nbResult?i.remove():this.$el.is(":visible")&&this._isElementVisible(i)&&(t.offset+=t.slice,t.fetch({remove:!1})))},_resize:function(t){var i=this.$el.find(".documentsList__documents__list__elements:visible");i.length>0&&i.height(e(window).innerHeight()-i.position().top-40),t!==!0&&this.currentSelectedModel&&this._needToLoadMore(this.currentSelectedModel,this.currentSelectedModel.get("associatedDocumentList"))},_isElementVisible:function(t){"function"==typeof e&&t instanceof e&&(t=t[0]);var i=t.getBoundingClientRect();return i.top>=0&&i.left>=0&&i.bottom<=(window.innerHeight||document.documentElement.clientHeight)&&i.right<=(window.innerWidth||document.documentElement.clientWidth)}})}),define("rsp/views/openDocumentListElement",["underscore","backbone"],function(e){var t=e.template('<a class="documentTab" href="#<%- initid %>" data-id="<%- initid %>" data-title="<%- title %>"><span class="documentTab__text">  <% if (icon) { %><img src="<%- icon %>" class="img-circle documentElement__icon" /> <% } %> <%- title %></span><button type="button" class="close documentTab__remove" aria-label="Close"><span aria-hidden="true">&times;</span></button></a>');return Backbone.View.extend({tagName:"li",events:{click:"selected","click .documentTab__remove":"remove"},initialize:function(){this.listenTo(this.model,"change",this.render),this.listenTo(this.model,"change:selected",this.indicateSelected),this.listenTo(this.model,"destroy",this.delete)},render:function(){return this.$el.empty().append(t(this.model.toJSON())),this.$el.attr("title",this.model.get("title")),this},selected:function(e){e.preventDefault(),this.model.trigger("selected",this.model)},indicateSelected:function(){this.model.get("selected")?this.$el.addClass("active"):this.$el.removeClass("active")},remove:function(){this.model.destroy()},"delete":function(){this.$el.remove()}})}),define("rsp/views/documentWidget",["jquery","underscore","dcpDocument/document","backbone"],function(e,t){return Backbone.View.extend({className:"documentsWrapper__div",initialize:function(){this.listenTo(this.model,"change:selected",this.indicateSelected),this.listenTo(this.model,"change:title",this.indicateSelected),this.listenTo(this.model,"change",this.setFrameName),this.listenTo(this.model,"destroy",this.delete),e(window).on("resize",t.debounce(t.bind(this._resize,this),100))},render:function(){var t=this;return this.$el.document("fetchDocument",{initid:this.model.id,viewId:this.model.get("viewId"),withoutResize:!0}),this.$el.document("addEvent","ready",function(i,n){t.model.set("initid",n.initid),t.model.set("title",n.title||""),t.model.set("viewId",n.viewId),t.model.set("icon",n.icon),n.title&&t.model.trigger("reloadDocument",n),e(this).find("header").hide(),t.$el.show()}),this.$el.document("addEvent","beforeClose",function(e,i,n){var o=t.model.collection.get(n.initid);return parseInt(n.initid,10)===parseInt(t.model.get("initid"),10)?void o.trigger("selected",o):(e.preventDefault(),void(o?o.trigger("selected",o):t.model.collection.add({initid:n.initid,title:"Chargement"})))}),this.$el.document("addEvent","afterSave",function(e,i,n){0===n.id&&t.model.trigger("reloadDocumentList")}),this.$el.document("addEvent","afterDelete",function(e,i){t.model.trigger("removeDocument",i)}),this.setFrameName(),this},indicateSelected:function(){this.model.get("selected")?(this.$el.show(),window.document.title=this.model.get("title"),this._resize()):this.$el.hide()},_resize:function(){var i=this;this.$el.is(":visible")&&(this.$el.find("iframe").height(e(window).innerHeight()-this.$el.position().top-40).width(this.$el.innerWidth()-1),t.defer(function(){i.$el.find("iframe").height(e(window).innerHeight()-i.$el.position().top-40)},50))},"delete":function(){this.$el.remove()},setFrameName:function(){var e="document_"+this.model.get("initid")+"_"+this.model.get("title");this.$el.find("iframe").attr("name",e)}})}),define("rsp/views/openDocument",["jquery","underscore","rsp/views/openDocumentListElement","rsp/views/documentWidget","backbone","bootstrap"],function(e,t,i,n){var o={global:t.template('<ul class="nav nav-tabs documentList">   <li class="openDocuments__openDocumentList visible-xs visible-sm">       <button class="btn btn-default"><span class="glyphicon glyphicon-menu-hamburger"></span></button>   </li>   <li class="openDocuments__createDocument">       <div class="btn-group" title="Créer un document">           <button type="button" class="btn btn-success dropdown-toggle" data-toggle="dropdown" aria-expanded="false">               <span class="glyphicon glyphicon-plus-sign"></span>               Nouveau <span class="caret"></span>           </button>           <ul class="dropdown-menu openDocuments__createDocument__families" role="menu">           </ul>       </div>   </li></ul><div class="documentsWrapper"></div>'),families:t.template('<% _.each(families, function(currentFamily) { %><li>   <a class="openDocuments__createDocument__familyElement" href="#<%- currentFamily.initid %>" data-initid="<%- currentFamily.initid %>">       <img src="<%- currentFamily.icon %>" class="img-circle documentElement__icon"><%- currentFamily.title %>   </a></li> <% }); %>')};return Backbone.View.extend({events:{"click .openDocuments__openDocumentList":"switchSide","click .openDocuments__createDocument__familyElement":"openCreation"},initialize:function(e){if(!e.openDocuments)throw new Error("You need an openDocuments collection");this.openDocuments=e.openDocuments,this.listenTo(this.openDocuments,"add",this._addDocument),this.listenTo(this.openDocuments,"selected",this.openDocumentIHM)},render:function(){return this.$el.append(o.global()),0===window.dcp.creatable_family.length?this.$el.find(".openDocuments__createDocument").remove():this.$el.find(".openDocuments__createDocument__families").append(o.families({families:window.dcp.creatable_family})),this.addPreload(),this},addPreload:function(){var t=e('<div class="documentPreload" style="display : none;"></div>');this.$el.find(".documentsWrapper").append(t),t.document({initid:"VOID_DOCUMENT"})},switchSide:function(){this.trigger("switchSide")},openDocumentIHM:function(){this.trigger("openDocumentIHM")},openCreation:function(t){var i=e(t.currentTarget);t.preventDefault(),this.openDocuments.add({initid:i.data("initid"),viewId:"!coreCreation"})},_addDocument:function(e){var t,o,s=new i({model:e});t=this.$el.find(".documentPreload"),t.removeClass("documentPreload"),o=new n({model:e,el:t}),this.$el.find(".documentList").append(s.render().$el),o.render(),e.trigger("selected",e),this.addPreload(),o._resize()}})}),require(["jquery","underscore","rsp/collections/search","rsp/collections/openDocument","rsp/views/searches","rsp/views/documentList","rsp/views/openDocument","dcpDocument/document"],function(e,t,i,n,o,s,c){var d=function(){e(".documentsList").toggleClass("hiddenLittle"),e(".openDocuments").toggleClass("hiddenLittle"),e(window).trigger("resize")};return window.dcp.search_list&&0!==window.dcp.search_list.length?(window.dcp=window.dcp||{},window.dcp.collections=window.dcp.collections||{},window.dcp.views=window.dcp.views||{},window.dcp.collections.searches=new i,window.dcp.collections.openDocuments=new n,void e(document).ready(function(){window.dcp.views.searches=new o({el:e(".documentsList__searchList"),collection:window.dcp.collections.searches}),window.dcp.views.searches.render(),window.dcp.views.documentList=new s({el:e(".documentsList__documents"),collection:window.dcp.collections.searches,openDocuments:window.dcp.collections.openDocuments}),window.dcp.views.openDocument=new c({el:e(".openDocuments"),openDocuments:window.dcp.collections.openDocuments}),window.dcp.views.openDocument.listenTo(window.dcp.views.openDocument,"switchSide",function(){d()}),window.dcp.views.openDocument.listenTo(window.dcp.views.openDocument,"openDocumentIHM",function(){e(".documentsList").addClass("hiddenLittle"),e(".openDocuments").removeClass("hiddenLittle"),e(window).trigger("resize")}),window.dcp.collections.openDocuments.listenTo(window.dcp.collections.openDocuments,"reloadDocumentList",function(){window.dcp.views.documentList.trigger("reloadDocumentList")}),window.dcp.collections.openDocuments.listenTo(window.dcp.collections.openDocuments,"reloadDocument",function(e){window.dcp.views.documentList.trigger("reloadDocument",e)}),window.dcp.collections.openDocuments.listenTo(window.dcp.collections.openDocuments,"removeDocument",function(e){window.dcp.views.documentList.trigger("removeDocument",e)}),e(".documentList__switch").on("click",function(){d()}),e(".unlog--button").on("click",function(){e("#disconnect").submit()}),window.dcp.views.openDocument.render(),window.dcp.views.documentList.render(),window.dcp.collections.searches.add(window.dcp.search_list),window.dcp.views.searches.displayDocumentList(),e(".loading--initial").hide(),e(".content").show(),e(window).trigger("resize")})):(e(".loading--initial").hide(),void e(".error__wrapper").show())}),define("RESPONSIVE_LIST/JS/main",function(){});
//# sourceMappingURL=main-built.js.map