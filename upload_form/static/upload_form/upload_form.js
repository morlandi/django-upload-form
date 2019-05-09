'use strict';

$(document).ready(function($) {
    UploadForm.initialize();
});

/*
TODO: Use HTML5 to resize an image before upload

https://stackoverflow.com/questions/23945494/use-html5-to-resize-an-image-before-upload
*/

// Today we feel zealous enough to use the Module Pattern ;)
window.UploadForm = (function() {

    function initialize() {
        UploadFormFileList.initialize('#umf_drop_area .file_list_wrapper');
        var dropArea = $('#umf_drop_area');
        dropArea.on('dragenter dragover', function(event) {
            event.preventDefault();
            dropArea.addClass('highlight');
        });
        dropArea.on('dragleave', function(event) {
            event.preventDefault();
            dropArea.removeClass('highlight');
        });
        dropArea.on('drop', onDropAreaDrop);
        dropArea.find('form').on('submit', onFormSubmit);
    }

    function onDropAreaDrop(event) {
        event.preventDefault();
        var dropArea = $('#umf_drop_area');
        dropArea.removeClass('highlight');
        //var files = event.dataTransfer.files;
        //event.originalEvent.dataTransfer.dropEffect = 'copy';
        var files = event.originalEvent.dataTransfer.files;
        dropArea.find('form input[type="file"]').prop('files', files);
        handleFiles(files);
    }

    function handleFiles(files) {
        // Append new files to fileList
        $(files).each(function(index, file) {
            UploadFormFileList.add(file);
        });

        // Update UI
        UploadFormFileList.refreshUI();
    }

    function getCookie(name) {
        var value = '; ' + document.cookie;
        var parts = value.split('; ' + name + '=');
        if (parts.length == 2) return parts.pop().split(';').shift();
    }

    function onFormSubmit(event)
    {
        event.preventDefault();
        var dropArea = $('#umf_drop_area');
        var form = $(dropArea.find('form'));

        dropArea.find('.progress').show();
        var progressBar = dropArea.find('.progress-bar');
        var url = form.attr('action');

        var filelist = UploadFormFileList.get_filelist();
        if (UPLOAD_FORM_PARALLEL_UPLOAD) {
            $(filelist).each(function(index, file) {
                sendSingleFile(file, url);
            });
        }
        else {
            sendMultipleFiles(filelist, url, progressBar);
        }
    }

    function sendSingleFile(file, url) {
        console.log('file: %o', file);
        var data = new FormData();
        data.set('files', file);
        console.log('sending file "%o"', file);

        $.ajax({
            type: "POST",
            url: url,
            data: data,
            dataType: 'json',
            processData: false,
            contentType: false,
            headers: {"X-CSRFToken": getCookie('csrftoken')},
            xhr: function() {
                var xhr = $.ajaxSettings.xhr();
                xhr.upload.onprogress = function(e) {
                    console.log(Math.floor(e.loaded / e.total *100) + '%');
                    // var progress = sprintf("%d%%", Math.floor(e.loaded / e.total *100));
                    // progressBar.css('width', progress);
                    // progressBar.text(progress);
                };
              return xhr;
            }
        }).done(function(data) {
            switch (data.action) {
                case 'replace':
                    dropArea.replaceWith(data.html);
                    initialize();
                    break;
                case 'redirect':
                    //window.location.replace(data.url);
                    console.log('done');
                    break;
            }
        }).fail(function(jqXHR, textStatus) {
            console.log('ERROR: %o', jqXHR);
            alert('ERROR: ' + jqXHR.statusText);
            window.location.replace(url);
        });
    }

    function sendMultipleFiles(filelist, url, progressBar) {

        // Retrieve files from form:
        //var data = new FormData(form.get(0));

        // Retrieve files from fileList;
        // As with regular form data, you can append multiple values with the same name.
        var data = new FormData();
        $(filelist).each(function(index, file) {
            data.append('files', file);
            data.append('title', 'ciao');
        });

        $.ajax({
            type: "POST",
            url: url,
            data: data,
            dataType: 'json',
            processData: false,
            contentType: false,
            headers: {"X-CSRFToken": getCookie('csrftoken')},
            xhr: function() {
                var xhr = $.ajaxSettings.xhr();
                xhr.upload.onprogress = function(e) {
                    console.log(Math.floor(e.loaded / e.total *100) + '%');
                    var progress = sprintf("%d%%", Math.floor(e.loaded / e.total *100));
                    progressBar.css('width', progress);
                    progressBar.text(progress);
                };
              return xhr;
            }
        }).done(function(data) {
            switch (data.action) {
                case 'replace':
                    dropArea.replaceWith(data.html);
                    initialize();
                    break;
                case 'redirect':
                    window.location.replace(data.url);
                    break;
            }
        }).fail(function(jqXHR, textStatus) {
            console.log('ERROR: %o', jqXHR);
            alert('ERROR: ' + jqXHR.statusText);
            window.location.replace(url);
        });
    }

    return {
        initialize: initialize,
        handleFiles: handleFiles
    };

})();
