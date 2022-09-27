<template>
    <div>
        <el-upload :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture"
            :headers="headerObj" :on-success="handleSuccess">
            <el-button size="small" type="primary">Upload</el-button>
        </el-upload>
        <el-dialog title="Preview" :visible.sync="previewVisible" width="100%">
            <img :src="previewPath" alt class="previewImg" width="100%" style="margin:0 auto"/>
        </el-dialog>

    </div>
</template>

<script>
export default {
    name: "singleUploader",
    
    data() {
        return {
            uploadURL: "http://localhost:88/api/third-party/s3/upload/file",
            headerObj: {
                Authorization: window.sessionStorage.getItem('token')
            },
            addForm: {
                pics: []
            },
            previewPath: "",
            previewVisible: false

        }
    },
    methods: {
        handlePreview(file) {
            console.log(file);
            this.previewPath = file.url;
            this.previewVisible = true;
        },
        handleRemove(file) {
            //console.log(this.addForm)
            //get temp path of the picture
            const filePath = file.url;
            //find the index of the picture fro pics array
            const i = this.addForm.pics.findIndex(x => x.pic === filePath);
            //delete picture from pics
            this.addForm.pics.splice(i, 1);
            //console.log(this.addForm);

        },
        handleSuccess(response) {
            console.log(response);
            //const picInfo = response.data.tmp_path;
            //this.addForm.pics.push(picInfo);
            console.log(this.addForm)
        }
    }
}
</script>