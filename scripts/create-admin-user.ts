import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdminUser() {
  const email = "admin@sagrapp.com"
  const password = "Sagrapp2023!"

  try {
    // Create user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      throw authError
    }

    console.log("User created successfully:", authData.user.id)

    // Update user role to admin
    const { error: updateError } = await supabase.from("users").update({ role: "admin" }).eq("id", authData.user.id)

    if (updateError) {
      throw updateError
    }

    console.log("User role updated to admin")
    console.log("Admin credentials:")
    console.log("Email:", email)
    console.log("Password:", password)
  } catch (error) {
    console.error("Error creating admin user:", error)
  }
}

createAdminUser()
