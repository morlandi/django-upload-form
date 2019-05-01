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

    var fileList = [];

    function initialize() {
        fileList = [];
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

        $('#umf_remove_all_files').on('click', clearFileList);
    }

    function _fileSize(b) {
        var u = 0;
        var s = 1024;
        while (b >= s || -b >= s) {
            b /= s;
            u++;
        }
        return (u ? b.toFixed(1) + ' ' : b) + ' KMGTPEZY'[u] + 'B';
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

    function removeFromFileList(filename) {
        // Remove specified item from fileList array;
        // returns true if successfull, false if not found
        var rc = false;
        $(fileList).each(function(index, item) {
            if (item.name == filename) {
                fileList.splice(index, 1);  // remove
                console.log('"%o" removed', filename);
                rc = true;
                return false;  // break
            }
        });
        return rc;
    }

    function addToFileList(file) {
        // Append this 'file' to fileList array;
        // To avoid duplicates, first removes the previoulsy inserted item
        // with same filename, if exists
        removeFromFileList(file.name);
        fileList.push(file);
    }

    function deleteFileListRow(element) {
        // Delete the file associated to this row,
        // then refresh UI
        event.preventDefault();
        var row = $(event.target).closest('tr');
        var filename = row.find('.filename').text();
        removeFromFileList(filename);
        refreshFileList();
    }

    function clearFileList(event) {
        // Remove all files in fileList array,
        // then refresh UI
        event.preventDefault();
        fileList = [];
        refreshFileList();
    }

    function refreshFileList() {
        // Update UI by refreshing the file display table;
        // also, restore row event handlers
        console.log('fileList: %o', fileList);
        if (fileList.length <= 0) {
            $('#umf_file_list_wrapper').hide();
            $('.umf_remove_file').off();
        }
        else {
            $('#umf_file_list_wrapper').show();
            var dropArea = $('#umf_drop_area');
            var fileDisplay = dropArea.find('.umf_file_list tbody');

            //dropArea.find('.umf_file_list, .submit').show();
            fileDisplay.html('');
            $(fileList).each(function(index, file) {
                fileDisplay.append(sprintf(
                    '<tr><td class="filetype">%s</td><td class="filename">%s</td><td class="numeric">%s</td><td>%s</td></tr>',
                    file.name.split('.').pop(),
                    file.name,
                    _fileSize(file.size),
                    '<a href="#" class="umf_remove_file" title="remove this"><i class="glyphicon glyphicon-trash"></i></a>'
                ));
            });
            $('.umf_remove_file').off().on('click', deleteFileListRow);
        }
    }

    function handleFiles(files) {
        // Append new files to fileList
        $(files).each(function(index, file) {
            addToFileList(file);
        });

        // Update UI
        refreshFileList();
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

        // Retrieve files from form:
        //var data = new FormData(form.get(0));

        // Retrieve files from fileList;
        // As with regular form data, you can append multiple values with the same name.
        var data = new FormData();
        $(fileList).each(function(index, file) {
            data.append('files', file);
        });

        var progressBar = dropArea.find('.progress-bar');
        dropArea.find('.progress').show();
        var url = form.attr('action');

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
