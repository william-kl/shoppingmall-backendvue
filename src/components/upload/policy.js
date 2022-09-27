import http from '@/utils/httpRequest.js'
export function policy() {
   return  new Promise((resolve,reject)=>{
        http({
            url: http.adornUrl("/third-party/s3/upload/file"),
            method: "post",
            params: http.adornParams({})
        }).then(({ data }) => {
            resolve(data);
        })
    });
}