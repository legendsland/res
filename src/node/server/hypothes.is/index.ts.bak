
import got from 'got';
import {keys} from '../../../../.keys';


const API = 'https://api.hypothes.is/api';
const TOKEN = keys.h.token;


export async function fetch() {

   // updateUri('lcqwfNxXEeydPwP03KX9Hw',
   //     'A Note on a Standard Strategy for Developing Loop Invariants and Loops',
   //     'http://localhost:3000/res/res/cs/paper/1982%20A%20Note%20on%20a%20Standard%20Strategy%20for%20Developing%20Loop%20Invariants%20and%20Loops.Gries.pdf');

}

async function fetchAll() {

   const {body, headers} = await got.get(`${api.links.search.url}?user=acct:zhy@hypothes.is`, {

      headers: {
         Accept: 'application/vnd.hypothesis.v1+json',
         Authorization: `Bearer ${TOKEN}`
      }

   });

   console.log(headers);
   console.log(body);
}

export async function fetchOne(id: string) {

   const url = api.links.annotation.read.url.replace(/:id/g, id);

   console.log(url);
   const {body, headers} = await got.get(`${url}?user=acct:zhy@hypothes.is`, {

      headers: {
         Accept: 'application/vnd.hypothesis.v1+json',
         Authorization: `Bearer ${TOKEN}`
      }

   });

   console.log(headers);
   console.log(body);
}

// needs to fetch and modify
export async function updateUri(id: string, title: string, uri: string) {
   // /html/body/div[3]/div[12]/div/div[8]/span/text()
   //*[@id="index_split_010.html"]/div/div[8]/span/text()
   const ann = {
      id: id,
      uri: uri,
      target: [
          {
             source: uri,
             selector: [
                {
                   end: 406,
                   type: "TextPositionSelector",
                   start: 297
                },
                {
                   type: "TextQuoteSelector",
                   exact: "A by-now-standard strategy for developing a loop invariant and loop was developedin [l] and explained in [2].",
                   prefix: "1982Revised March 1983Abstract. ",
                   suffix: " Nevertheless, its use still pos"
                }
             ]
          }
      ],
      document: {
         title: [
            title
         ]
      },
      links: {
         incontext: 'https://hyp.is/' + id + '/' + uri.substring('http://'.length)
      }
   }

   const url = api.links.annotation.update.url.replace(/:id/g, ann.id);

   console.log(url);
   console.log(JSON.stringify(ann));
   const {body, headers} = await got.patch(`${url}?user=acct:zhy@hypothes.is`, {

      headers: {
         Accept: 'application/vnd.hypothesis.v1+json',
         Authorization: `Bearer ${TOKEN}`
      },

      json: ann

   });

   console.log(headers);
   console.log(body);
}

const api =
{
    "links":{
       "annotation":{
          "create":{
             "method":"POST",
             "url":"https://api.hypothes.is/api/annotations",
             "desc":"Create an annotation"
          },
          "delete":{
             "method":"DELETE",
             "url":"https://api.hypothes.is/api/annotations/:id",
             "desc":"Delete an annotation"
          },
          "read":{
             "method":"GET",
             "url":"https://api.hypothes.is/api/annotations/:id",
             "desc":"Fetch an annotation"
          },
          "update":{
             "method":"PATCH",
             "url":"https://api.hypothes.is/api/annotations/:id",
             "desc":"Update an annotation"
          },
          "flag":{
             "method":"PUT",
             "url":"https://api.hypothes.is/api/annotations/:id/flag",
             "desc":"Flag an annotation for review"
          },
          "hide":{
             "method":"PUT",
             "url":"https://api.hypothes.is/api/annotations/:id/hide",
             "desc":"Hide an annotation as a group moderator"
          },
          "unhide":{
             "method":"DELETE",
             "url":"https://api.hypothes.is/api/annotations/:id/hide",
             "desc":"Unhide an annotation as a group moderator"
          }
       },
       "search":{
          "method":"GET",
          "url":"https://api.hypothes.is/api/search",
          "desc":"Search for annotations"
       },
       "bulk":{
          "method":"POST",
          "url":"https://api.hypothes.is/api/bulk",
          "desc":"Perform multiple operations in one call"
       },
       "group":{
          "member":{
             "add":{
                "method":"POST",
                "url":"https://api.hypothes.is/api/groups/:pubid/members/:userid",
                "desc":"Add the user in the request params to a group."
             },
             "delete":{
                "method":"DELETE",
                "url":"https://api.hypothes.is/api/groups/:pubid/members/:userid",
                "desc":"Remove the current user from a group"
             }
          },
          "create":{
             "method":"POST",
             "url":"https://api.hypothes.is/api/groups",
             "desc":"Create a new group"
          },
          "read":{
             "method":"GET",
             "url":"https://api.hypothes.is/api/groups/:id",
             "desc":"Fetch a group"
          },
          "members":{
             "read":{
                "method":"GET",
                "url":"https://api.hypothes.is/api/groups/:pubid/members",
                "desc":"Fetch all members of a group"
             }
          },
          "update":{
             "method":"PATCH",
             "url":"https://api.hypothes.is/api/groups/:id",
             "desc":"Update a group"
          },
          "create_or_update":{
             "method":"PUT",
             "url":"https://api.hypothes.is/api/groups/:id",
             "desc":"Create or update a group"
          }
       },
       "groups":{
          "read":{
             "method":"GET",
             "url":"https://api.hypothes.is/api/groups",
             "desc":"Fetch the user's groups"
          }
       },
       "links":{
          "method":"GET",
          "url":"https://api.hypothes.is/api/links",
          "desc":"URL templates for generating URLs for HTML pages"
       },
       "profile":{
          "read":{
             "method":"GET",
             "url":"https://api.hypothes.is/api/profile",
             "desc":"Fetch the user's profile"
          },
          "groups":{
             "read":{
                "method":"GET",
                "url":"https://api.hypothes.is/api/profile/groups",
                "desc":"Fetch the current user's groups"
             }
          },
          "update":{
             "method":"PATCH",
             "url":"https://api.hypothes.is/api/profile",
             "desc":"Update a user's preferences"
          }
       },
       "user":{
          "create":{
             "method":"POST",
             "url":"https://api.hypothes.is/api/users",
             "desc":"Create a new user"
          },
          "read":{
             "method":"GET",
             "url":"https://api.hypothes.is/api/users/:userid",
             "desc":"Fetch a user"
          },
          "update":{
             "method":"PATCH",
             "url":"https://api.hypothes.is/api/users/:username",
             "desc":"Update a user"
          }
       }
    }
 }
 ;

