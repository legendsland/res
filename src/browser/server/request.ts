/********************************************************************************
 * Copyright (C) 2023 Zhangyi
 ********************************************************************************/
import $ from 'jquery';

export async function post(url: string, data: any) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url,
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
        })
            .then((d) => {
                resolve(d);
            })
            .catch((error) => {
                reject(error);
            });
    });
}
