// import { auth } from "$lib/server/auth";
// import { fail, redirect } from "@sveltejs/kit";


// export const actions = {
//     default: async ({ request }) => {
//         const form = await request.formData();
//         const email = form.get('email')?.toString().trim();
//         const password = form.get('password')?.toString().trim();

//         if (!email || !password) {
//             return fail(400, { message: 'All fields are required!!' });
//         }
//         const db = await getDb();
//         const res = await db.collection('users').insertOne({
//             firstname:fname,
//             lastname: lname,
//             email: email,
//             createdAt: new Date()
//         })
//         return { success: true, message: 'yayyy!!!' }
//     }
// }