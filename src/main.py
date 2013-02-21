import webapp2

import json
import logging

from models import List

class CreateList(webapp2.RequestHandler):
    def post(self):
        name = self.request.get("name", default_value="Unnamed List")
        tok = self.request.get("token", default_value=None)

        if not tok:
            logging.warn("Invalid createList")
            self.response.write("Invalid")
            return

        List(name=name,
             master_token = tok).put()

        

class JoinList(webapp2.RequestHandler):
    def post(self, resource):
        
        list = ndb.Key(urlsafe=resoruce).get()

        self.response.write(json.dumps({"token": list.master_token}))

class ListLists(webapp2.RequestHandler):
    def get(self):
        lists = List.query().fetch(20)

        newList = []
        for item in lists:
            newList.append({"name": item.name,
                            "listKey": item.key.urlsafe()})
        
        self.response.write(json.dumps(newList))

app = webapp2.WSGIApplication([('/joinList/([^/]+)?', JoinList),
                               ('/createList', CreateList),
                               ('/listLists', ListLists)],
                              debug=True)
