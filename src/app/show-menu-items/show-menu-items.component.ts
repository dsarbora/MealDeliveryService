import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { FirebaseListObservable } from 'angularfire2/database';
import { MenuItem }  from '../models/menuItem.model';
import { Order }  from '../models/order.model';
import { OrderItem }  from '../models/orderItem.model';
import { Restaurant }  from '../models/restaurant.model';
import { RestaurantService } from '../restaurant.service';
import { ShoppingCartService } from '../shopping-cart.service';


@Component({
  selector: 'app-show-menu-items',
  templateUrl: './show-menu-items.component.html',
  styleUrls: ['./show-menu-items.component.css'],
  providers: [RestaurantService, ShoppingCartService]
})
export class ShowMenuItemsComponent implements OnInit {

  order: Order = null; // the index in ORDERS
  userKey: string = '1';
  restaurantKey: string;
  restaurantToDisplay: Restaurant;
  menuItems: MenuItem[] = [];

  constructor(private route: ActivatedRoute, private location: Location, private restaurantService: RestaurantService, private shoppingCartService: ShoppingCartService) { }

  ngOnInit() {
    this.route.params.forEach((urlParameters) => {
      this.restaurantKey = urlParameters['restaurantKey'];
    });

    this.restaurantService.getRestaurantByKey(this.restaurantKey).subscribe(dataLastEmittedFromObserver => {
//      let restaurant = dataLastEmittedFromObserver;
      let items: MenuItem[] = [];

      for(let i = 0; i < dataLastEmittedFromObserver.menu_items.length; i++){
        let subItems: string[] = [];

        for(let j = 0; j < dataLastEmittedFromObserver.menu_items[i].menu_sub_items.length; j++){
          subItems.push(dataLastEmittedFromObserver.menu_items[i].menu_sub_items[j]);
        }
        let newItem = new MenuItem(dataLastEmittedFromObserver.menu_items[i].menu_item_name,
                     dataLastEmittedFromObserver.menu_items[i].cost,
                     dataLastEmittedFromObserver.menu_items[i].preparation_time,
                     subItems);

        items.push(newItem);
        this.menuItems.push(newItem);
      }
      this.restaurantToDisplay = new Restaurant(
                     dataLastEmittedFromObserver.restaurant_name,
                     dataLastEmittedFromObserver.street_address,
                     dataLastEmittedFromObserver.hours,
                     dataLastEmittedFromObserver.website,
                     dataLastEmittedFromObserver.cuisine,
                     items);
    });
  }

  addToCart(menuItemToAdd: MenuItem){
    if(this.order === null){
      this.order = this.shoppingCartService.getOrder(this.restaurantKey);
    }

    let newOrderItem = new OrderItem(menuItemToAdd.menuItemName, 1, parseInt(menuItemToAdd.menuItemCost));

    if(this.order === null){
      let newOrder = new Order(this.userKey, new Date(), new Date(), this.restaurantKey, [], 0);
      this.shoppingCartService.addNewOrder(newOrder);
      this.order = newOrder;
    }

    this.order.addNewOrderItem(newOrderItem);

    console.log(this.order);

  }
}
