    var iframeUrl;
    var tutorID;
    var tutorialTitle;
    var tutorUID;
    var showSave;

    function closeDialog(outer_dialog) {
        if (outer_dialog != undefined) {
            outer_dialog.close();
        }
    }

    function saveMacro() {

        var macroParams = {
            iframeUrl: iframeUrl,
            tutorID: tutorID,
            tutorialTitle: tutorialTitle,
            tutorUID: tutorUID
        };

        outer_confluence.saveMacro(macroParams);
        outer_confluence.closeMacroEditor();
        closeDialog(outer_dialog);
        return true;
    }

    $(document).ready(function() {

        $("#cancelCapture, #cancelSolution, #cancelEditing").click(function() {
            closeDialog(outer_dialog);
        });

        $("#saveEditing").click(function() {
            saveMacro();
        });

        $("#insertSolution").click(function() {
            saveMacro();
            showSave = true;
        });

        $("#startCapturing").click(function() {

            var options = {};
            options.pluginType = "confluence_cloud";
            iorad.init(options, function() {

                iorad.createTutorial();

                iorad.on('editor:close', function(tutorialParams) {

                    serializeTutorial(tutorialParams);
                    $("#create-solution").hide();
                    $("#insert-solution").show();
                    $("#solutionPreviewContainer").html(iframeUrl);
                   
                });
            });
        });


        $("#editSolution, #editEditing").click(function() {

            var options = {};
            options.pluginType = "confluence_cloud";
            iorad.init(options, function() {

                var tutorialParam = {
                    tutorialId: tutorID,
                    tutorialTitle: tutorialTitle,
                    uid: tutorUID
                };

                iorad.editTutorial(tutorialParam);

                iorad.on('editor:close', function(tutorialParams) {

                    serializeTutorial(tutorialParams);

                    if(showSave) {
                        $("#insert-solution").hide();
                        $("#edit-solution").show();
                        $("#previewContainer").html(iframeUrl);
                        $("#saveEditing").show();
                        $("#cancelEditing").hide();
                    } else {
                        $("#edit-solution").hide();
                        $("#insert-solution").show();
                        $("#solutionPreviewContainer").html(iframeUrl);
                    }
                    
                     
                });
            });
        });
    });



    function serializeTutorial(tutorialParams) {
        iframeUrl = iorad.getEmbeddedPlayerUrl(tutorialParams.uid,
            tutorialParams.tutorialId, tutorialParams.tutorialTitle);

        tutorID = tutorialParams.tutorialId;
        tutorialTitle = tutorialParams.tutorialTitle;
        tutorUID = tutorialParams.uid;
    }

    function getAttrsFromIframe(iframeStr, strSeek) {
        pattern = strSeek + "=\"";
        indexOfSeek = iframeStr.indexOf(pattern);
        iframeStr = iframeStr.substring(indexOfSeek + pattern.length);
        indexOfStolb = iframeStr.indexOf("\"");
        return iframeStr.substring(0, indexOfStolb);
    }

    function getUrlParameter(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
