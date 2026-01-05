const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const API_URL = 'http://localhost:5000/api/products';
let productId = '';

async function verifyProductStatus() {
    console.log('Starting verification...');

    try {
        // 1. Create a product (should be isAvailable: true by default)
        console.log('1. Creating product...');
        const formData = new FormData();
        formData.append('name', 'Test Product Status');
        formData.append('price', '100');
        formData.append('description', 'Test Description');
        formData.append('stock', '10');

        // We need an image, but let's try without image if allowed, or mock it.
        // The controller checks req.file. If not present, imageUrl is null.
        // Let's see if we can get away without an image or just pass a string if the controller allows (it does check req.file first).

        let response = await axios.post(API_URL, {
            name: 'Test Product Status',
            price: 100,
            description: 'Test Description',
            stock: 10
        });

        productId = response.data._id;
        console.log('Product created:', productId, 'isAvailable:', response.data.isAvailable);

        if (response.data.isAvailable !== true) {
            throw new Error('Default isAvailable should be true');
        }

        // 2. Update status to false
        console.log('2. Updating status to false...');
        response = await axios.put(`${API_URL}/${productId}`, {
            isAvailable: false
        });
        console.log('Product updated, isAvailable:', response.data.isAvailable);

        if (response.data.isAvailable !== false) {
            throw new Error('Failed to update isAvailable to false');
        }

        // 3. Fetch all with isAvailable=true (should NOT find it)
        console.log('3. Fetching isAvailable=true...');
        response = await axios.get(`${API_URL}?isAvailable=true`);
        const processedProducts = response.data;
        const foundTrue = processedProducts.find(p => p._id === productId);
        console.log('Found in isAvailable=true list?', !!foundTrue);

        if (foundTrue) {
            throw new Error('Product should NOT be in isAvailable=true list');
        }

        // 4. Fetch all with isAvailable=false (should find it)
        console.log('4. Fetching isAvailable=false...');
        response = await axios.get(`${API_URL}?isAvailable=false`);
        const foundFalse = response.data.find(p => p._id === productId);
        console.log('Found in isAvailable=false list?', !!foundFalse);

        if (!foundFalse) {
            throw new Error('Product SHOULD be in isAvailable=false list');
        }

        // 5. Cleanup (Delete)
        console.log('5. Deleting product...');
        await axios.delete(`${API_URL}/${productId}`);
        console.log('Product deleted.');

        console.log('✅ Verification SUCCESS!');

    } catch (error) {
        console.error('❌ Verification FAILED:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
        // Attempt cleanup if product was created
        if (productId) {
            try { await axios.delete(`${API_URL}/${productId}`); } catch (e) { }
        }
        process.exit(1);
    }
}

verifyProductStatus();
