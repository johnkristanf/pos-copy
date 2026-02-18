<?php

return [
    'order_item' => [
        'served' => 'served',
        'partially_served' => 'partially_served',
        'unserved' => 'unserved',

        'pending' => 'pending',
        'sold' => 'sold',
    ],
    'payments' => [
        'fully_paid' => 'fully_paid',
        'partially_paid' => 'partially_paid',
        'pending' => 'pending',
        'cancelled' => 'cancelled',
    ],

    'adjustments' => [
        'for_checking' => 'for_checking',
        'for_approval' => 'for_approval',
        'approved' => 'approved',
        'rejected' => 'rejected',
        'pending' => 'pending',
    ],

    'returns_to_supplier' => [
        'for_checking' => 'for_checking',
        'for_approval' => 'for_approval',

        // Only for page filters
        'pending' => 'pending',
        'approved' => 'approved',
        'rejected' => 'rejected',
    ],

    'returns_from_customer' => [
        'for_checking' => 'for_checking',
        'for_approval' => 'for_approval',

        // Only for page filters
        'pending' => 'pending',
        'approved' => 'approved',
        'rejected' => 'rejected',
    ],
];
