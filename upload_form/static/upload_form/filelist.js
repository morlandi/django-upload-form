'use strict';

// Today we feel zealous enough to use the Module Pattern ;)
window.UploadFormFileList = (function() {

    var fileList = [];
    var wrapper = null;

    function initialize(wrapper_element) {
        wrapper = $(wrapper_element);
        wrapper.find('.uploadform_remove_all_files').on('click', clear);
        fileList = [];
    }

    function get_filelist() {
        return fileList;
    }

    function removeByFilename(filename) {
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

    function add(file) {
        // Append this 'file' to fileList array;
        // To avoid duplicates, first removes the previoulsy inserted item
        // with same filename, if exists
        removeByFilename(file.name);
        fileList.push(file);
    }

    function deleteFileListRow(element) {
        // Delete the file associated to this row,
        // then refresh UI
        event.preventDefault();
        var row = $(event.target).closest('tr');
        var filename = row.find('.filename').text();
        removeByFilename(filename);
        refreshUI();
    }

    function clear(event) {
        // Remove all files in fileList array,
        // then refresh UI
        if (event) {
            event.preventDefault();
        }
        fileList = [];
        refreshUI();
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

    function refreshUI() {
        // Update UI by refreshing the file display table;
        // also, restore row event handlers
        console.log('fileList: %o', fileList);
        if (fileList.length <= 0) {
            wrapper.hide();
            wrapper.find('.uploadform_remove_file').off();
        }
        else {
            wrapper.show();
            var fileDisplay = wrapper.find('table tbody');

            fileDisplay.html('');
            $(fileList).each(function(index, file) {

                // fileDisplay.append(sprintf(
                //     '<tr><td class="filetype">%s</td><td class="filename">%s</td><td class="numeric">%s</td><td class="delete">%s</td></tr>',
                //     file.name.split('.').pop(),
                //     file.name,
                //     _fileSize(file.size),
                //     '<a href="#" class="uploadform_remove_file" title="remove this"><img src="/static/upload_form/icons/trash-svgrepo-com.svg" class="icon"></a>'
                // ));

                var fname = file.name;
                var ftype = file.name.split('.').pop();
                var fsize = _fileSize(file.size);
                var rmlink = '<a href="#" class="uploadform_remove_file" title="remove this"><img src="/static/upload_form/icons/trash-svgrepo-com.svg" class="icon"></a>';
                fileDisplay.append(
                    '<tr>' +
                    '<td class="filetype">' + ftype + '</td>' +
                    '<td class="filename">' + fname + '</td>' +
                    '<td class="numeric">' + fsize + '</td>' +
                    '<td class="delete">' + rmlink + '</td>' +
                    '</tr>'
                );
            });
            wrapper.find('.uploadform_remove_file').off().on('click', deleteFileListRow);
        }
    }

    return {
        initialize: initialize,
        get_filelist: get_filelist,
        add: add,
        refreshUI: refreshUI
    };

})();
