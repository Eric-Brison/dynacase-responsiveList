/**
 * Created by charles on 10/03/15.
 */
require(["jquery",
    "underscore",
    "rsp/collections/search",
    "rsp/collections/openDocument",
    "rsp/views/searches",
    "rsp/views/documentList",
    "rsp/views/openDocument",
    "dcpDocument/document"], function rsp_require($, _, CollectionSearch, CollectionOpenDocument,
                                                  ViewSearches, ViewDocumentList, ViewOpenDocument)
{

    "use strict";

    var toogleLittleMode = function() {
        $(".documentsList").toggleClass("hidden-xs");
        $(".openDocuments").toggleClass("hidden-xs");
        $(window).trigger("resize");
    };

    window.dcp = window.dcp || {};

    window.dcp.collections = window.dcp.collections || {};
    window.dcp.views = window.dcp.views || {};

    window.dcp.collections.searches = new CollectionSearch();
    window.dcp.collections.searches.fetch();
    window.dcp.collections.openDocuments = new CollectionOpenDocument();

    $(document).ready(function rsp_ready()
    {
        window.dcp.views.searches = new ViewSearches({
            el: $(".documentsList__searchList"),
            collection: window.dcp.collections.searches
        });
        window.dcp.views.searches.render();
        window.dcp.views.documentList = new ViewDocumentList({
            el: $(".documentsList__documents"),
            collection: window.dcp.collections.searches,
            openDocuments : window.dcp.collections.openDocuments
        });
        window.dcp.views.openDocument = new ViewOpenDocument({
            el: $(".openDocuments"),
            openDocuments: window.dcp.collections.openDocuments
        });
        window.dcp.views.openDocument.listenTo(window.dcp.views.openDocument, "switchSide", function() {
            toogleLittleMode();
        });
        window.dcp.views.openDocument.listenTo(window.dcp.views.openDocument, "openDocumentIHM", function ()
        {
            $(".documentsList").addClass("hidden-xs");
            $(".openDocuments").removeClass("hidden-xs");
            $(window).trigger("resize");
        });
        $(".documentList__switch").on("click", function() {
            toogleLittleMode();
        });
        window.dcp.views.openDocument.render();
        window.dcp.views.documentList.render();
        $(".loading--initial").hide();
        $(".content").show();
    });
});