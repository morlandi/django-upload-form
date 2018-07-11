'use strict';

$(document).ready(function($) {
    UploadForm.initialize();
});


// Module Pattern

window.UploadForm = (function() {

    function initialize() {
        var dropArea = $('#umf_drop_area');
        dropArea.on('dragenter dragover', function(event) {
            event.preventDefault();
            dropArea.addClass('highlight');
        });
        dropArea.on('dragleave', function(event) {
            event.preventDefault();
            dropArea.removeClass('highlight');
          });;
        dropArea.on('drop', onDropAreaDrop);
        dropArea.find('form').on('submit', onFormSubmit);
    }

    function _fileSize(b) {
        var u = 0, s=1024;
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
        var files = event.originalEvent.dataTransfer.files;
        dropArea.find('form input[type="file"]').prop('files', files);
        //handleFiles(files);
    }

    function handleFiles(files) {
        console.log('handleFiles(%o)', files);
        var dropArea = $('#umf_drop_area');
        var fileList = dropArea.find('.umf_file_list tbody');

        dropArea.find('.umf_file_list, .submit').show();

        fileList.html('');
        $(files).each(function(index, file) {
            fileList.append(sprintf(
                '<tr><td>%s</td><td>%s</td><td class="numeric">%s</td></tr>',
                file.name.split('.').pop(),
                file.name,
                _fileSize(file.size)
            ));
        });
    }

    function onFormSubmit(event)
    {
        event.preventDefault();
        var dropArea = $('#umf_drop_area');
        var form = $(dropArea.find('form'));
        var data = new FormData(form.get(0));
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
